# gRPC & gRPC-Web Services on Fly.io

> Run gRPC & gRPC-Web services close to users with [Fly](https://fly.io/).

## Overview

This application demonstrates how to use Fly and gRPC to run your services close to users all over the world. 

Fly runs tiny virtual machines at edge datacenters close to your users, with each edge including a local Redis cache, and the ability to broadcast commands globally. 

The gRPC system is a way to define and run fast services with very low overhead and streaming abilities, while offering client and server code genration for many languages and VMs — including JVM/Java/Kotlin/Android, .NET, C++, Dart, Go, Node, PHP, Python, Objective-C/Swift, Ruby; and browser based JS via gRPC-Web adapters. This application combines these technologies to create a gRPC server and gRPC-Web proxy on Fly.

gRPC servers run on their own special protocol that's based on HTTP/2, so they offer excellent performance benefits but may not work out of the box with many hosting systems. This also prevents you from calling the services directly from a web browser, so we have a special proxy that converts the gRPC streams to normal HTTP requests. This allows you to create the client stubs and use them in browser-based JavaScript.  

This examples uses the [gRPC](https://grpc.io) libraries for the main gRPC service and  [grpcwebproxy](https://github.com/improbable-eng/grpc-web/tree/master/go/grpcwebproxy) for browser support.

## What we'll deploy

Since this is an example, we'll write a quick gRPC service definition in `hello.proto`: 
```protobuf
service MainService {
  rpc Hello(Empty) returns (Greeting);
  rpc Clock(Empty) returns (stream Time);
}
```

## Deploying the gRPC service to Fly

- Install [flyctl](https://fly.io/docs/getting-started/installing-flyctl/)
- Login to Fly: `flyctl auth login`
- Create a new Fly app using `flyctl init`
- The gRPC app needs a bit of special configuration, as described in `fly.template.toml` – you can either copy it over or just use the provided script with `sh import_fly_template.sh`. 
- Deploy the app to Fly: `flyctl deploy`

### Deploying the gRPC-Web Proxy

- `cd` into the `web-proxy` directory. 
- Update the `Dockerfile` to point to your deployed gRPC service. The `--backend_addr=grpc-example-app.fly.dev:443` property needs to be updated to your app's hostname.
- Create the web proxy app on Fly with `flyctl init` and opt to use the existing Dockerfile.
- The configuration for this app is in `fly.temlplate.toml` – you can either copy it over or use the `sh import_fly_template.sh` script again.
- Deploy the app to Fly: `flyctl deploy`.

## Using the gRPC service

With gRPC, you'll usually use the generated client libraries in the language of your choice, but to make sure our service is working now we'll use the [`grpcurl`](https://github.com/fullstorydev/grpcurl) tool:
```
grpcurl -proto hello.proto grpc-example-app.fly.dev:443 MainService/Hello 
```

You can also test that streaming is working as you'd expect by calling the `Clock` method, which streams out a timestamp every second:
```
grpcurl -proto hello.proto grpc-example-app.fly.dev:443 MainService/Clock 
``` 

## What's Happening Inside

The gRPC servers that we're running have one special feature that makes them difficult to deploy on many systems – they use the relatively new HTTP/2 protocol with a special feature called HTTP Trailers. Most HTTP/2 load balancers will terminate the HTTP/2 connection at the load balancer, and then make a more compliant HTTP/1.1 connection on the backend to the application server. This won't work with gRPC, so we need to drop down to using lower-level TCP load balancing.

Luckily, Fly supports TCP balancing just fine, with the following configuration in your `fly.toml`:
```toml
[[services]]
  internal_port = 54321
  protocol = "tcp"

  [[services.ports]]
    handlers = ["tls"]
    port = "443"
```

We're also need to telling Fly to have only a TLS (no HTTP) listener on 443 – this takes care of encryption and allows fly to terminate TLS with the default, managed, or the configured certificates. If we wanted to, we could also handle TLS entirely within the application itself, by removing all Fly listeners and activating the [TCP Passthrough](https://fly.io/docs/services/#tcp-pass-through). 
 
 Once the TCP request reaches your gRPC application, the server will then take over and provide threading / event loop / goroutine management, depending on your chosen language, along with serialization and deserialization. 
 
 ### What does the web proxy do?
 
 Because the gRPC services uses HTTP/2 as a base, you can't make requests to it from inside a browser — there are currently no browser APIs that allow directly reading of a HTTP/2 connection. To enable use inside a browser, we'll deploy a proxy that converts a normal HTTP request to and from the gRPC HTTP/2 format. This allows you to generate a client stub and use it inside the browser as you would from any other server side programming language. See [gRPC-Web](https://grpc.io/docs/languages/web/) for the special client code and limitations. 
 
## How Does Fly Fit Into This?

While gRPC works really well when communicating between servers on the same rack or same datacenter, the principles it uses apply equally well to clients on websites or mobile devices. The HTTP/2 communication channel remains open as much as possible to provide a low-latency and low-energy way to speak to your server. The underlying [Protocol Buffers](https://developers.google.com/protocol-buffers) serialization/de-serialization system is very low-overhead, so it's great for cellular or metered-bandwidth connections. 

Running your backend services on Fly lets you put your services really close to every user in your global client base. If your data is in a central location, your services can use the local Redis cache that Fly provides at each edge location to cache data, and broadcast changes or invalidations via the [global Redis command broadcast](https://fly.io/docs/redis/#managing-redis-data-globally). There are also solutions like [DynamoDB Global Tables](https://aws.amazon.com/dynamodb/global-tables/) (NoSQL), [Aurora Multi-Master](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-global-database.html) (SQL) or [Google Cloud Spanner](https://cloud.google.com/spanner) that can help spread your data across the world and closer to your application servers. 

The reduced latency from having your servers close to your clients is especially useful in gRPC where you want all your calls to finish as quickly as possible. If your clients are mobile applications, they'll benefit even more from the latency reduction when they're running on cellular networks, where bandwidth is low and re-connections are common. 


## Testing gRPC performance with `ghz`

Because gRPC applications use a special wire protocol, we can't use `cURL`, `wget` or `siege` like we would on normal servers. Instead, there are special gRPC-aware tools like [ghz](https://ghz.sh) that work great. After you enable the Fly regions you'd like to run your service in and set the container CPU & memory configuration to the size you need, you can use `ghz` to test your service:

```
ghz grpc-example-app.fly.dev:443 --call=MainService/Hello --proto=hello.proto
```
Keep in mind that this test will run against your closest enabled Fly region, which may or may not be the region that your users will use. gRPC testing also works a little different, in that because the HTTP/2 connection is re-used a lot across many different requests, testing against dummy methods that don't do much is really just a test of single connection bandwidth. The best way to make sure your service is running great would be to enable the instrumentation provided in your client and service libraries and exercise your service in a real-world secenario.