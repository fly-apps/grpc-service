const {Empty, Greeting, Time} = require('./hello_pb.js');
const {MainServiceClient} = require('./hello_grpc_web_pb.js');

var client = new MainServiceClient('https://grpc-web-proxy-test.fly.dev:443');

client.hello(new Empty(), {}, (err, response) => {
    console.log(response.getMessage());
});

var clockStream = client.clock(new Empty(), {});
clockStream.on('data', function(response) {
    console.log(response.getTimestamp());
});
