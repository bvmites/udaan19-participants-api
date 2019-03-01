const router = require('express').Router();
const newParticipantSchema = require('../../schema/newParticipants');

const Validator = require('jsonschema').Validator;
const validator = new Validator();


module.exports = () => {



    //POST participants/create
    router.post('/create', async(request, response)=>{
        let newParticipant = request.body;
        // try{
        //
        // }
    });

    return router;
};