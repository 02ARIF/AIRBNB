const mongoose = require('mongoose');
const initData = require('./data');
const Lisiting = require('../models/listing');

const MOGO_URL = "mongodb://127.0.0.1:27017/AIRBNB";
main().then(()=>{
    console.log('connected')
}).catch((err)=>{
    console.log(err)
})

async function main() {
    await mongoose.connect(MOGO_URL);
    
}
const initDb = async()=>{
    await Lisiting.deleteMany({});
    initData.data=initData.data.map((obj)=>({...obj, owner:'6a98ee9536229c40ce62a57f'}));
    await Lisiting.insertMany(initData.data);
    console.log('data was initialized');
};
initDb();