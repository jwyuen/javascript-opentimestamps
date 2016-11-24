'use strict';

var StreamDeserializationContext=require("./StreamDeserializationContext.js");
var Utils=require("./Utils.js");
var Notary=require("./Notary.js");
var Ops=require("./Ops.js");

var msg = "";
var attestations ={};
var ops= [];



class Timestamp {

    constructor(msg) {
        this.msg=msg;
        this.attestations=[];
        this.ops=[];
    }


    static deserialize  (initial_msg){

        console.log("deserialize: ",Utils.bytesToHex(initial_msg))
        var self= new Timestamp(initial_msg);


        function do_tag_or_attestation (tag) {
            console.log("do_tag_or_attestation: ", Utils.bytesToHex([tag.charCodeAt()]));
            if (tag == '\x00') {
                var attestation = Notary.TimeAttestation.deserialize();
                self.attestations.push(attestation);
                console.log("attestation ",attestation);
            } else {

                var op = Ops.Op.deserialize_from_tag(tag);

                var result = op.call(initial_msg);
                console.log("result: ",Utils.bytesToHex(result));

                var stamp= Timestamp.deserialize(result)
                self.ops[op] = stamp

                console.log("OK");

            }
        };

        var tag = StreamDeserializationContext.read_bytes(1);
        var tag = String.fromCharCode(tag[0])[0];

        while(tag=='\xff'){
            var current= StreamDeserializationContext.read_bytes(1);
            do_tag_or_attestation(current,initial_msg);
            tag = StreamDeserializationContext.read_bytes(1);
        }
        do_tag_or_attestation(tag,initial_msg);
        return self;
    };

}

module.exports = Timestamp;
