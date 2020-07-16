/**
 * @fileoverview gRPC-Web generated client stub for 
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!


/* eslint-disable */
// @ts-nocheck



const grpc = {};
grpc.web = require('grpc-web');

const proto = require('./hello_pb.js');

/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?Object} options
 * @constructor
 * @struct
 * @final
 */
proto.MainServiceClient =
    function(hostname, credentials, options) {
  if (!options) options = {};
  options['format'] = 'text';

  /**
   * @private @const {!grpc.web.GrpcWebClientBase} The client
   */
  this.client_ = new grpc.web.GrpcWebClientBase(options);

  /**
   * @private @const {string} The hostname
   */
  this.hostname_ = hostname;

};


/**
 * @param {string} hostname
 * @param {?Object} credentials
 * @param {?Object} options
 * @constructor
 * @struct
 * @final
 */
proto.MainServicePromiseClient =
    function(hostname, credentials, options) {
  if (!options) options = {};
  options['format'] = 'text';

  /**
   * @private @const {!grpc.web.GrpcWebClientBase} The client
   */
  this.client_ = new grpc.web.GrpcWebClientBase(options);

  /**
   * @private @const {string} The hostname
   */
  this.hostname_ = hostname;

};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.Empty,
 *   !proto.Greeting>}
 */
const methodDescriptor_MainService_Hello = new grpc.web.MethodDescriptor(
  '/MainService/Hello',
  grpc.web.MethodType.UNARY,
  proto.Empty,
  proto.Greeting,
  /**
   * @param {!proto.Empty} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.Greeting.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.Empty,
 *   !proto.Greeting>}
 */
const methodInfo_MainService_Hello = new grpc.web.AbstractClientBase.MethodInfo(
  proto.Greeting,
  /**
   * @param {!proto.Empty} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.Greeting.deserializeBinary
);


/**
 * @param {!proto.Empty} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @param {function(?grpc.web.Error, ?proto.Greeting)}
 *     callback The callback function(error, response)
 * @return {!grpc.web.ClientReadableStream<!proto.Greeting>|undefined}
 *     The XHR Node Readable Stream
 */
proto.MainServiceClient.prototype.hello =
    function(request, metadata, callback) {
  return this.client_.rpcCall(this.hostname_ +
      '/MainService/Hello',
      request,
      metadata || {},
      methodDescriptor_MainService_Hello,
      callback);
};


/**
 * @param {!proto.Empty} request The
 *     request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!Promise<!proto.Greeting>}
 *     A native promise that resolves to the response
 */
proto.MainServicePromiseClient.prototype.hello =
    function(request, metadata) {
  return this.client_.unaryCall(this.hostname_ +
      '/MainService/Hello',
      request,
      metadata || {},
      methodDescriptor_MainService_Hello);
};


/**
 * @const
 * @type {!grpc.web.MethodDescriptor<
 *   !proto.Empty,
 *   !proto.Time>}
 */
const methodDescriptor_MainService_Clock = new grpc.web.MethodDescriptor(
  '/MainService/Clock',
  grpc.web.MethodType.SERVER_STREAMING,
  proto.Empty,
  proto.Time,
  /**
   * @param {!proto.Empty} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.Time.deserializeBinary
);


/**
 * @const
 * @type {!grpc.web.AbstractClientBase.MethodInfo<
 *   !proto.Empty,
 *   !proto.Time>}
 */
const methodInfo_MainService_Clock = new grpc.web.AbstractClientBase.MethodInfo(
  proto.Time,
  /**
   * @param {!proto.Empty} request
   * @return {!Uint8Array}
   */
  function(request) {
    return request.serializeBinary();
  },
  proto.Time.deserializeBinary
);


/**
 * @param {!proto.Empty} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.Time>}
 *     The XHR Node Readable Stream
 */
proto.MainServiceClient.prototype.clock =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/MainService/Clock',
      request,
      metadata || {},
      methodDescriptor_MainService_Clock);
};


/**
 * @param {!proto.Empty} request The request proto
 * @param {?Object<string, string>} metadata User defined
 *     call metadata
 * @return {!grpc.web.ClientReadableStream<!proto.Time>}
 *     The XHR Node Readable Stream
 */
proto.MainServicePromiseClient.prototype.clock =
    function(request, metadata) {
  return this.client_.serverStreaming(this.hostname_ +
      '/MainService/Clock',
      request,
      metadata || {},
      methodDescriptor_MainService_Clock);
};


module.exports = proto;

