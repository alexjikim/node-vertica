// Generated by CoffeeScript 1.6.3
var AuthenticationMethods, BackendMessage, messageClass, name, typeOIDs, _ref, _ref1, _ref10, _ref11, _ref12, _ref13, _ref14, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AuthenticationMethods = require('./authentication').methods;

typeOIDs = require('./types').typeOIDs;

BackendMessage = (function() {
  BackendMessage.prototype.typeId = null;

  function BackendMessage(buffer) {
    this.read(buffer);
  }

  BackendMessage.prototype.read = function(buffer) {};

  return BackendMessage;

})();

BackendMessage.Authentication = (function(_super) {
  __extends(Authentication, _super);

  function Authentication() {
    _ref = Authentication.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Authentication.prototype.typeId = 82;

  Authentication.prototype.read = function(buffer) {
    this.method = buffer.readUInt32BE(0);
    if (this.method === AuthenticationMethods.MD5_PASSWORD) {
      return this.salt = buffer.readUInt32BE(4);
    } else if (this.method === AuthenticationMethods.CRYPT_PASSWORD) {
      return this.salt = buffer.readUInt16BE(4);
    }
  };

  return Authentication;

})(BackendMessage);

BackendMessage.BackendKeyData = (function(_super) {
  __extends(BackendKeyData, _super);

  function BackendKeyData() {
    _ref1 = BackendKeyData.__super__.constructor.apply(this, arguments);
    return _ref1;
  }

  BackendKeyData.prototype.typeId = 75;

  BackendKeyData.prototype.read = function(buffer) {
    this.pid = buffer.readUInt32BE(0);
    return this.key = buffer.readUInt32BE(4);
  };

  return BackendKeyData;

})(BackendMessage);

BackendMessage.ParameterStatus = (function(_super) {
  __extends(ParameterStatus, _super);

  function ParameterStatus() {
    _ref2 = ParameterStatus.__super__.constructor.apply(this, arguments);
    return _ref2;
  }

  ParameterStatus.prototype.typeId = 83;

  ParameterStatus.prototype.read = function(buffer) {
    this.name = buffer.readZeroTerminatedString(0);
    return this.value = buffer.readZeroTerminatedString(this.name.length + 1);
  };

  return ParameterStatus;

})(BackendMessage);

BackendMessage.NotificationResponse = (function(_super) {
  __extends(NotificationResponse, _super);

  function NotificationResponse() {
    _ref3 = NotificationResponse.__super__.constructor.apply(this, arguments);
    return _ref3;
  }

  NotificationResponse.prototype.typeId = 65;

  NotificationResponse.prototype.read = function(buffer) {
    this.pid = buffer.readUInt32BE(4);
    this.channel = buffer.readZeroTerminatedString(4);
    return this.payload = buffer.readZeroTerminatedString(this.channel.length + 5);
  };

  return NotificationResponse;

})(BackendMessage);

BackendMessage.EmptyQueryResponse = (function(_super) {
  __extends(EmptyQueryResponse, _super);

  function EmptyQueryResponse() {
    _ref4 = EmptyQueryResponse.__super__.constructor.apply(this, arguments);
    return _ref4;
  }

  EmptyQueryResponse.prototype.typeId = 73;

  return EmptyQueryResponse;

})(BackendMessage);

BackendMessage.RowDescription = (function(_super) {
  __extends(RowDescription, _super);

  function RowDescription() {
    _ref5 = RowDescription.__super__.constructor.apply(this, arguments);
    return _ref5;
  }

  RowDescription.prototype.typeId = 84;

  RowDescription.prototype.read = function(buffer) {
    var fieldDescriptor, formatCode, i, modifier, name, numberOfFields, pos, size, tableFieldIndex, tableOID, typeOID, _i;
    numberOfFields = buffer.readUInt16BE(0);
    pos = 2;
    this.columns = [];
    for (i = _i = 0; 0 <= numberOfFields ? _i < numberOfFields : _i > numberOfFields; i = 0 <= numberOfFields ? ++_i : --_i) {
      name = buffer.readZeroTerminatedString(pos);
      pos += Buffer.byteLength(name) + 1;
      tableOID = buffer.readUInt32BE(pos);
      pos += 4;
      tableFieldIndex = buffer.readUInt16BE(pos);
      pos += 2;
      typeOID = buffer.readUInt32BE(pos);
      pos += 4;
      size = buffer.readUInt16BE(pos);
      pos += 2;
      modifier = buffer.readUInt32BE(pos);
      pos += 4;
      formatCode = buffer.readUInt16BE(pos);
      pos += 2;
      fieldDescriptor = {
        name: name,
        tableOID: tableOID,
        tableFieldIndex: tableFieldIndex,
        typeOID: typeOID,
        type: typeOIDs[typeOID],
        size: size,
        modifier: modifier,
        formatCode: formatCode
      };
      this.columns.push(fieldDescriptor);
    }
    return void 0;
  };

  return RowDescription;

})(BackendMessage);

BackendMessage.DataRow = (function(_super) {
  __extends(DataRow, _super);

  function DataRow() {
    _ref6 = DataRow.__super__.constructor.apply(this, arguments);
    return _ref6;
  }

  DataRow.prototype.typeId = 68;

  DataRow.prototype.read = function(buffer) {
    var data, i, length, numberOfFields, pos, _i;
    numberOfFields = buffer.readUInt16BE(0);
    pos = 2;
    this.values = [];
    for (i = _i = 0; 0 <= numberOfFields ? _i < numberOfFields : _i > numberOfFields; i = 0 <= numberOfFields ? ++_i : --_i) {
      length = buffer.readUInt32BE(pos);
      pos += 4;
      if (length === 4294967295) {
        data = null;
      } else {
        data = buffer.slice(pos, pos + length);
        pos += length;
      }
      this.values.push(data);
    }
    return void 0;
  };

  return DataRow;

})(BackendMessage);

BackendMessage.CommandComplete = (function(_super) {
  __extends(CommandComplete, _super);

  function CommandComplete() {
    _ref7 = CommandComplete.__super__.constructor.apply(this, arguments);
    return _ref7;
  }

  CommandComplete.prototype.typeId = 67;

  CommandComplete.prototype.read = function(buffer) {
    return this.status = buffer.readZeroTerminatedString(0);
  };

  return CommandComplete;

})(BackendMessage);

BackendMessage.CloseComplete = (function(_super) {
  __extends(CloseComplete, _super);

  function CloseComplete() {
    _ref8 = CloseComplete.__super__.constructor.apply(this, arguments);
    return _ref8;
  }

  CloseComplete.prototype.typeId = 51;

  return CloseComplete;

})(BackendMessage);

BackendMessage.ParameterDescription = (function(_super) {
  __extends(ParameterDescription, _super);

  function ParameterDescription() {
    _ref9 = ParameterDescription.__super__.constructor.apply(this, arguments);
    return _ref9;
  }

  ParameterDescription.prototype.typeId = 116;

  ParameterDescription.prototype.read = function(buffer) {
    var count, i;
    count = buffer.readUInt16BE(0);
    return this.parameterTypes = (function() {
      var _i, _results;
      _results = [];
      for (i = _i = 0; 0 <= count ? _i < count : _i > count; i = 0 <= count ? ++_i : --_i) {
        _results.push(buffer.readUInt32BE(2 + i * 4));
      }
      return _results;
    })();
  };

  return ParameterDescription;

})(BackendMessage);

BackendMessage.ParseComplete = (function(_super) {
  __extends(ParseComplete, _super);

  function ParseComplete() {
    _ref10 = ParseComplete.__super__.constructor.apply(this, arguments);
    return _ref10;
  }

  ParseComplete.prototype.typeId = 49;

  return ParseComplete;

})(BackendMessage);

BackendMessage.ErrorResponse = (function(_super) {
  __extends(ErrorResponse, _super);

  function ErrorResponse() {
    _ref11 = ErrorResponse.__super__.constructor.apply(this, arguments);
    return _ref11;
  }

  ErrorResponse.prototype.typeId = 69;

  ErrorResponse.prototype.fieldNames = {
    83: 'Severity',
    67: 'Code',
    77: 'Message',
    68: 'Detail',
    72: 'Hint',
    80: 'Position',
    112: 'Internal position',
    113: 'Internal query',
    87: 'Where',
    70: 'File',
    76: 'Line',
    82: 'Routine'
  };

  ErrorResponse.prototype.read = function(buffer) {
    var fieldCode, pos, value;
    this.information = {};
    fieldCode = buffer.readUInt8(0);
    pos = 1;
    while (fieldCode !== 0x00) {
      value = buffer.readZeroTerminatedString(pos);
      this.information[this.fieldNames[fieldCode] || fieldCode] = value;
      pos += Buffer.byteLength(value) + 1;
      fieldCode = buffer.readUInt8(pos);
      pos += 1;
    }
    return this.message = this.information['Message'];
  };

  return ErrorResponse;

})(BackendMessage);

BackendMessage.NoticeResponse = (function(_super) {
  __extends(NoticeResponse, _super);

  function NoticeResponse() {
    _ref12 = NoticeResponse.__super__.constructor.apply(this, arguments);
    return _ref12;
  }

  NoticeResponse.prototype.typeId = 78;

  return NoticeResponse;

})(BackendMessage.ErrorResponse);

BackendMessage.ReadyForQuery = (function(_super) {
  __extends(ReadyForQuery, _super);

  function ReadyForQuery() {
    _ref13 = ReadyForQuery.__super__.constructor.apply(this, arguments);
    return _ref13;
  }

  ReadyForQuery.prototype.typeId = 90;

  ReadyForQuery.prototype.read = function(buffer) {
    return this.transactionStatus = buffer.readUInt8(0);
  };

  return ReadyForQuery;

})(BackendMessage);

BackendMessage.CopyInResponse = (function(_super) {
  __extends(CopyInResponse, _super);

  function CopyInResponse() {
    _ref14 = CopyInResponse.__super__.constructor.apply(this, arguments);
    return _ref14;
  }

  CopyInResponse.prototype.typeId = 71;

  CopyInResponse.prototype.read = function(buffer) {
    var i, numberOfFields, pos, _i;
    this.globalFormatType = buffer.readUInt8(0);
    this.fieldFormatTypes = [];
    numberOfFields = buffer.readUInt16BE(1);
    pos = 3;
    for (i = _i = 0; 0 <= numberOfFields ? _i < numberOfFields : _i > numberOfFields; i = 0 <= numberOfFields ? ++_i : --_i) {
      this.fieldFormatTypes.push(buffer.readUInt8(pos));
      pos += 1;
    }
    return void 0;
  };

  return CopyInResponse;

})(BackendMessage);

BackendMessage.types = {};

for (name in BackendMessage) {
  messageClass = BackendMessage[name];
  if (messageClass.prototype && (messageClass.prototype.typeId != null)) {
    messageClass.prototype.event = name;
    BackendMessage.types[messageClass.prototype.typeId] = messageClass;
  }
}

BackendMessage.fromBuffer = function(buffer) {
  var message, typeId;
  typeId = buffer.readUInt8(0);
  messageClass = BackendMessage.types[typeId];
  if (messageClass != null) {
    message = new messageClass(buffer.slice(5));
    return message;
  } else {
    throw new Error("Unknown message type: " + typeId);
  }
};

module.exports = BackendMessage;
