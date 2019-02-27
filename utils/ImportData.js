let fs = require('fs');
let parse = require('csv-parse/lib/sync');
let MongoClient = require('mongodb').MongoClient;
let dotenv = require('dotenv');
let crypto = require('crypto');
dotenv.config();


const inputFile = 'utils/Data/NonTech/nt3.csv';

// let event = {};

function readEventDataNew(fileName) {
    const data = fs.readFileSync(fileName);
    return parse(data).map(column => {

        const thestr = column[5]+column[4];
        let code = crypto.createHmac('sha512','theKey').update(thestr).digest('hex').toString().slice(0,8);


        let event = {
            rec_no: column[1],
            eventName: column[6],
            code: code,
            round: 0
        };
        // console.log(event);
        return{
            name: column[2].toLowerCase(),
            branch: column[3].toLowerCase(),
            year: column[4],
            phone: column[5],
            events: [event],
            // code: code
        };
    }).slice(1); //remove header
}

let newData = readEventDataNew(inputFile);
// console.log(newData);


async function getData(db){
    try{
        // const newData = readEventDataNew(inputFile);
        const storedData = await db.collection('participants').find({}).toArray();
        let storedPhones = [];
        storedData.map(data=>{
            storedPhones.push(data.phone);
        });
        // console.log(storedPhones);
        let newPhones = [];
        newData.map(data=>{
            newPhones.push(data.phone);
        });
        // console.log(newPhones);
        newPhones.forEach(async phone => {
            try{
                if (storedPhones.includes(phone)) {
                    let theP = await db.collection('participants').findOne({phone: phone});
                    delete theP._id;
                    // console.log(theP);

                    newData.forEach(async data => {
                        if (data.phone === phone) {
                            theP.events.push(data.events[0]);
                            let event = await db.collection('events').findOneAndUpdate({eventName: data.events[0].eventName},{$addToSet:{participants:data.phone}});
                        }
                    });

                    // console.log("##");
                    let theRes = await db.collection('participants').findOneAndReplace({phone: phone}, theP);
                }else{
                    // console.log("***");
                    newData.forEach(async data => {
                        if (data.phone === phone) {
                            let res = await db.collection('participants').insertOne(data);
                            let event = await db.collection('events').findOneAndUpdate({eventName: data.events[0].eventName},{$addToSet:{participants:data.phone}});
                        }
                    });
                }
            }catch (e) {
                console.log(e.message);
            }
        });
    }catch (e) {
        console.log(e.message);
    }
}

(async ()=>{
    const client = await MongoClient.connect(process.env.DB, { useNewUrlParser: true});
    const db = client.db('Udaan-19');

    let res = await getData(db);

    console.log("Done!");
})();

