# gRPC & gRPC-Web Services on Fly.io

> Run gRPC & gRPC-Web services close to users with [Fly](https://fly.io/).

## Overview

<!---- cut here --->

This application demonstrates how to use Fly and gRPC to run your services close to users all over the world. 

Fly runs tiny virtual machines at edge datacenters close to your users, with each edge including a local Redis cache, and the ability to broadcast commands globally. The gRPC system is a way to define and run fast services with very low overhead and streaming abilities, while offering client and server code genration for many languages and VMs — including JVM/Java/Kotlin/Android, .NET, C++, Dart, Go, Node, PHP, Python, Objective-C/Swift, Ruby; and browser based JS via gRPC-Web adapters. This application combines these technologies to create a gRPC server and gRPC-Web proxy on Fly. 

It uses the [gRPC](https://grpc.io) libraries for the main gRPC service and  [grpcwebproxy](https://github.com/improbable-eng/grpc-web/tree/master/go/grpcwebproxy) for browser support. We'll also use [buildpacks](https://fly.io/blog/simpler-fly-deployments-nodejs-rails-golang-java/) for easy deployment. 

## Deploying to Fly

- Install [flyctl](https://fly.io/docs/getting-started/installing-flyctl/)
- Login to Fly: `flyctl auth login`
- Create a new Fly app: `flyctl apps create` - don't overwrite the configuration at this point, the special configuration that gRPC requires has been set in `fly.toml`. 

- Deploy the app to Fly: `flyctl deploy -a my-grpc-app`

## Using the gRPC service

With gRPC you'll usually use the generated client libraries in the language of your choice, but to make sure our service is working now we'll use the grpcurl tool:
```
grpcurl -proto hello.proto my-grpc-app.fly.dev:443 MainService/Hello 
```

You can also test that streaming is working as you'd expect by calling the `Clock` method, which streams out a timestamp every second:
```
grpcurl -proto hello.proto my-grpc-app.fly.dev:443 MainService/Clock 
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

We're also need to telling Fly to have only a TLS (no HTTP) listener on 443 – this takes care of encryption and allows fly to terminate TLS with the default, managed, or the configured certificates. We could also handle TLS entirely within the application itself, by removing all Fly listeners and activating the [TCP Passthrough](https://fly.io/docs/services/#tcp-pass-through). 
 
 Once the TCP request reaches your gRPC application, the server will then take over and provide threading / event loop / goroutine management, depending on your chosen language, along with serialization and deserialization. 
 
## How Does Fly Fit Into This?

While gRPC is often used to communicate between servers on the same rack or same datacenter, the principles it uses apply really well to clients on websites or mobile devices. The HTTP/2 communication channel is kept open as much as possible to provide a low-latency and low-energy way to speak to your server, and the protocol is very low-overhead so great for cellular or metered-bandwidth connections. It's also easy to re-connect on unreliable networks.

Running your backend services on Fly lets you put these services really close to every customer or user in your global client base. If your data is in a central location, your services can use the local Redis cache that Fly provides at each edge location to cache data, and broadcast changes or invalidations via the [global Redis command broadcast](https://fly.io/docs/redis/#managing-redis-data-globally). There are also solutions like [DynamoDB Global Tables](https://aws.amazon.com/dynamodb/global-tables/) (NoSQL) or [Aurora Multi-Master](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-global-database.html) (SQL) that can help move your data close to your application servers. 

The reduced latency from having your servers close to your clients is especially useful in gRPC where you want all your calls to finish as quickly as possible. If your clients are mobile applications, they'll benefit even more from the latency reduction when they're running on cellular networks, where re-connections are common. 


## Testing gRPC performance with `ghz`

Because gRPC applications use a special wire protocol, we can't use `cURL` or `wget` like we normally would to test them. There are special gRPC-aware tools like [ghz](https://ghz.sh) that work great. After you enable the Fly regions you'd like to run your service in and set the container CPU & memory configuration to the size you need, `ghz` is great way to test your service's performance. 