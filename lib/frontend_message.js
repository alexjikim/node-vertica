// Generated by CoffeeScript 1.6.3
var Authentication, Buffer, FrontendMessage, _ref, _ref1, _ref2, _ref3, _ref4,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice;

Authentication = require('./authentication');

Buffer = require('./buffer').Buffer;

FrontendMessage = (function() {
  function FrontendMessage() {}

  FrontendMessage.prototype.typeId = null;

  FrontendMessage.prototype.payload = function() {
    return new Buffer(0);
  };

  FrontendMessage.prototype.toBuffer = function() {
    var b, bLength, headerLength, messageBuffer, payloadBuffer, pos;
    payloadBuffer = this.payload();
    if (typeof payloadBuffer === 'string') {
      bLength = Buffer.byteLength(payloadBuffer);
      b = new Buffer(bLength + 1);
      b.writeZeroTerminatedString(payloadBuffer, 0);
      payloadBuffer = b;
    }
    headerLength = this.typeId != null ? 5 : 4;
    messageBuffer = new Buffer(headerLength + payloadBuffer.length);
    if (this.typeId) {
      messageBuffer.writeUInt8(this.typeId, 0);
      pos = 1;
    } else {
      pos = 0;
    }
    messageBuffer.writeUInt32BE(payloadBuffer.length + 4, pos);
    payloadBuffer.copy(messageBuffer, pos + 4);
    return messageBuffer;
  };

  return FrontendMessage;

})();

FrontendMessage.Startup = (function(_super) {
  __extends(Startup, _super);

  Startup.prototype.typeId = null;

  Startup.prototype.protocol = 3 << 16;

  function Startup(user, database, options) {
    this.user = user;
    this.database = database;
    this.options = options;
  }

  Startup.prototype.payload = function() {
    var pl, pos;
    pos = 0;
    pl = new Buffer(8192);
    pl.writeUInt32BE(this.protocol, pos);
    pos += 4;
    if (this.user) {
      pos += pl.writeZeroTerminatedString('user', pos);
      pos += pl.writeZeroTerminatedString(this.user, pos);
    }
    if (this.database) {
      pos += pl.writeZeroTerminatedString('database', pos);
      pos += pl.writeZeroTerminatedString(this.database, pos);
    }
    if (this.options) {
      pos += pl.writeZeroTerminatedString('options', pos);
      pos += pl.writeZeroTerminatedString(this.options, pos);
    }
    pl.writeUInt8(0, pos);
    pos += 1;
    return pl.slice(0, pos);
  };

  return Startup;

})(FrontendMessage);

FrontendMessage.SSLRequest = (function(_super) {
  __extends(SSLRequest, _super);

  function SSLRequest() {
    _ref = SSLRequest.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  SSLRequest.prototype.typeId = null;

  SSLRequest.prototype.sslMagicNumber = 80877103;

  SSLRequest.prototype.payload = function() {
    var pl;
    pl = new Buffer(4);
    pl.writeUInt32BE(this.sslMagicNumber, 0);
    return pl;
  };

  return SSLRequest;

})(FrontendMessage);

FrontendMessage.Password = (function(_super) {
  __extends(Password, _super);

  Password.prototype.typeId = 112;

  function Password(password, authMethod, options) {
    this.password = password;
    this.authMethod = authMethod;
    this.options = options;
    if (this.password == null) {
      this.password = '';
    }
    if (this.authMethod == null) {
      this.authMethod = Authentication.methods.CLEARTEXT_PASSWORD;
    }
    if (this.options == null) {
      this.options = {};
    }
  }

  Password.prototype.md5 = function() {
    var hash, value, values, _i, _len;
    values = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    hash = require('crypto').createHash('md5');
    for (_i = 0, _len = values.length; _i < _len; _i++) {
      value = values[_i];
      hash.update(value);
    }
    return hash.digest('hex');
  };

  Password.prototype.encodedPassword = function() {
    var salt;
    switch (this.authMethod) {
      case Authentication.methods.CLEARTEXT_PASSWORD:
        return this.password;
      case Authentication.methods.MD5_PASSWORD:
        salt = new Buffer(4);
        salt.writeUInt32BE(this.options.salt, 0);
        return "md5" + this.md5(this.md5(this.password, this.options.user), salt);
      default:
        throw new Error("Authentication method " + this.authMethod + " not implemented.");
    }
  };

  Password.prototype.payload = function() {
    return this.encodedPassword();
  };

  return Password;

})(FrontendMessage);

FrontendMessage.CancelRequest = (function(_super) {
  __extends(CancelRequest, _super);

  CancelRequest.prototype.cancelRequestMagicNumber = 80877102;

  function CancelRequest(backendPid, backendKey) {
    this.backendPid = backendPid;
    this.backendKey = backendKey;
  }

  CancelRequest.prototype.payload = function() {
    var b;
    b = new Buffer(12);
    b.writeUInt32BE(this.cancelRequestMagicNumber, 0);
    b.writeUInt32BE(this.backendPid, 4);
    b.writeUInt32BE(this.backendKey, 8);
    return b;
  };

  return CancelRequest;

})(FrontendMessage);

FrontendMessage.Close = (function(_super) {
  __extends(Close, _super);

  Close.prototype.typeId = 67;

  function Close(type, name) {
    this.name = name;
    if (this.name == null) {
      this.name = "";
    }
    this.type = (function() {
      switch (type) {
        case 'portal':
        case 'p':
        case 'P':
        case 80:
          return 80;
        case 'prepared_statement':
        case 'prepared':
        case 'statement':
        case 's':
        case 'S':
        case 83:
          return 83;
        default:
          throw new Error("" + type + " not a valid type to describe");
      }
    })();
  }

  Close.prototype.payload = function() {
    var b;
    b = new Buffer(this.name.length + 2);
    b.writeUInt8(this.type, 0);
    b.writeZeroTerminatedString(this.name, 1);
    return b;
  };

  return Close;

})(FrontendMessage);

FrontendMessage.Describe = (function(_super) {
  __extends(Describe, _super);

  Describe.prototype.typeId = 68;

  function Describe(type, name) {
    this.name = name;
    if (this.name == null) {
      this.name = "";
    }
    this.type = (function() {
      switch (type) {
        case 'portal':
        case 'P':
        case 80:
          return 80;
        case 'prepared_statement':
        case 'prepared':
        case 'statement':
        case 'S':
        case 83:
          return 83;
        default:
          throw new Error("" + type + " not a valid type to describe");
      }
    })();
  }

  Describe.prototype.payload = function() {
    var b;
    b = new Buffer(this.name.length + 2);
    b.writeUInt8(this.type, 0);
    b.writeZeroTerminatedString(this.name, 1);
    return b;
  };

  return Describe;

})(FrontendMessage);

FrontendMessage.Execute = (function(_super) {
  __extends(Execute, _super);

  Execute.prototype.typeId = 69;

  function Execute(portal, maxRows) {
    this.portal = portal;
    this.maxRows = maxRows;
    if (this.portal == null) {
      this.portal = "";
    }
    if (this.maxRows == null) {
      this.maxRows = 0;
    }
  }

  Execute.prototype.payload = function() {
    var b, pos;
    b = new Buffer(5 + this.portal.length);
    pos = b.writeZeroTerminatedString(this.portal, 0);
    b.writeUInt32BE(this.maxRows, pos);
    return b;
  };

  return Execute;

})(FrontendMessage);

FrontendMessage.Query = (function(_super) {
  __extends(Query, _super);

  Query.prototype.typeId = 81;

  function Query(sql) {
    this.sql = sql;
  }

  Query.prototype.payload = function() {
    return this.sql;
  };

  return Query;

})(FrontendMessage);

FrontendMessage.Parse = (function(_super) {
  __extends(Parse, _super);

  Parse.prototype.typeId = 80;

  function Parse(name, sql, parameterTypes) {
    this.name = name;
    this.sql = sql;
    this.parameterTypes = parameterTypes;
    if (this.name == null) {
      this.name = "";
    }
    if (this.parameterTypes == null) {
      this.parameterTypes = [];
    }
  }

  Parse.prototype.payload = function() {
    var b, paramType, pos, _i, _len, _ref1;
    b = new Buffer(8192);
    pos = b.writeZeroTerminatedString(this.name, 0);
    pos += b.writeZeroTerminatedString(this.sql, pos);
    b.writeUInt16BE(this.parameterTypes.length, pos);
    pos += 2;
    _ref1 = this.parameterTypes;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      paramType = _ref1[_i];
      b.writeUInt32BE(paramType, pos);
      pos += 4;
    }
    return b.slice(0, pos);
  };

  return Parse;

})(FrontendMessage);

FrontendMessage.Bind = (function(_super) {
  __extends(Bind, _super);

  Bind.prototype.typeId = 66;

  function Bind(portal, preparedStatement, parameterValues) {
    var parameterValue, _i, _len;
    this.portal = portal;
    this.preparedStatement = preparedStatement;
    this.parameterValues = [];
    for (_i = 0, _len = parameterValues.length; _i < _len; _i++) {
      parameterValue = parameterValues[_i];
      this.parameterValues.push(parameterValue.toString());
    }
  }

  Bind.prototype.payload = function() {
    var b, pos, value, _i, _len, _ref1;
    b = new Buffer(8192);
    pos = 0;
    pos += b.writeZeroTerminatedString(this.portal, pos);
    pos += b.writeZeroTerminatedString(this.preparedStatement, pos);
    b.writeUInt16BE(0x00, pos);
    b.writeUInt16BE(this.parameterValues.length, pos + 2);
    pos += 4;
    _ref1 = this.parameterValues;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      value = _ref1[_i];
      b.writeUInt32BE(value.length, pos);
      pos += 4;
      pos += b.write(value, pos);
    }
    return b.slice(0, pos);
  };

  return Bind;

})(FrontendMessage);

FrontendMessage.Flush = (function(_super) {
  __extends(Flush, _super);

  function Flush() {
    _ref1 = Flush.__super__.constructor.apply(this, arguments);
    return _ref1;
  }

  Flush.prototype.typeId = 72;

  return Flush;

})(FrontendMessage);

FrontendMessage.Sync = (function(_super) {
  __extends(Sync, _super);

  function Sync() {
    _ref2 = Sync.__super__.constructor.apply(this, arguments);
    return _ref2;
  }

  Sync.prototype.typeId = 83;

  return Sync;

})(FrontendMessage);

FrontendMessage.Terminate = (function(_super) {
  __extends(Terminate, _super);

  function Terminate() {
    _ref3 = Terminate.__super__.constructor.apply(this, arguments);
    return _ref3;
  }

  Terminate.prototype.typeId = 88;

  return Terminate;

})(FrontendMessage);

FrontendMessage.CopyData = (function(_super) {
  __extends(CopyData, _super);

  CopyData.prototype.typeId = 100;

  function CopyData(data) {
    this.data = data;
  }

  CopyData.prototype.payload = function() {
    return new Buffer(this.data);
  };

  return CopyData;

})(FrontendMessage);

FrontendMessage.CopyDone = (function(_super) {
  __extends(CopyDone, _super);

  function CopyDone() {
    _ref4 = CopyDone.__super__.constructor.apply(this, arguments);
    return _ref4;
  }

  CopyDone.prototype.typeId = 99;

  return CopyDone;

})(FrontendMessage);

FrontendMessage.CopyFail = (function(_super) {
  __extends(CopyFail, _super);

  CopyFail.prototype.typeId = 102;

  function CopyFail(error) {
    this.error = error;
  }

  CopyFail.prototype.payload = function() {
    return this.error;
  };

  return CopyFail;

})(FrontendMessage);

module.exports = FrontendMessage;
