const fs = require('fs');
const path = require('path');
const csvWriter = require('csv-writer').createObjectCsvWriter;
const wavsData = require('./index.js');
const ExcelJS = require('exceljs');
const { flatMapDeep } = require('lodash');
const XLSX = require('xlsx');
const xlsx = require('node-xlsx');
const notifier = require('node-notifier');


const directoryPath = './wavOutput';
const oldFilePath = './csvTable/Output/Old.xlsx';
const outputFilePath = './csvTable/Output/Output.xlsx';
const oldDataIds = [];
var oldDataJson = {};

async function oldXlsxToJson() {
    if (fs.existsSync(oldFilePath)){
        const workSheetsFromFile = xlsx.parse(oldFilePath);
        const oldData = workSheetsFromFile[0].data.slice(1);
        //console.log(oldData);
        oldData.forEach((item)=>{
            if(item!=null){
                oldDataIds.push(item[0]);
            }
    });
        //console.log(oldDataIds);
        oldDataJson = oldData.reduce((obj, item) => {
        const key = item[0];
        obj[key] = item;
        return obj;
    }, {});
        //console.log(oldDataJson);
    }
    else{
        notifier.notify({
            title: 'warning',
            message: 'No old file'
        });
    }
}

async function mixWavsData(data) {
    oldXlsxToJson()
    const events = {};
    data.forEach((obj) => {
        const filePath = obj.wavpath;
        const fileName = path.parse(filePath).name.replace("-","_");
        console.log(fileName);
        events[fileName] = {};
        try {
            events[fileName]['id'] = events[fileName]['id'] = parseInt((fileName.split('_')[1].match(/\d+/))[0]);
            events[fileName]['type'] = fileName.split('_')[2];
            events[fileName]['time'] = obj.time === -1 ? 0.000 : obj.time;
        } catch (e) {
            return;
            // 处理异常情况
        };

        if (events[fileName]['type'] === 'Hit') {
            events[fileName]['event_name'] = fileName.split('_').slice(0, 3).join('_');
        }
        else {
            events[fileName]['event_name'] = fileName.split('_').slice(0, 4).join('_');
        }
    });

    let ids = [];
    let rows = [];

    for (let event_name in events) {
        ids.push(events[event_name]['id']);
    }
    ids = [...new Set(ids)];

    for (let id of ids) {
        if (!rows[id]) {
            rows[id] = {
                '技能ID': id,
                '技能说明': "",
                '第一帧触发的event': "",
                '过程技能event': "",
                '击中event': "",
                '目标区域event': "",
            };
        }
    }
    for (let event_name in events) {
        switch (events[event_name]['type']) {
            case 'A':
                rows[events[event_name]['id']]["第一帧触发的event"] =
                    rows[events[event_name]['id']]["第一帧触发的event"] == ""
                        ? events[event_name]['event_name']
                        : (rows[events[event_name]['id']]["第一帧触发的event"].split("||").includes(events[event_name]['event_name'])
                            ? rows[events[event_name]['id']]["第一帧触发的event"]
                            : rows[events[event_name]['id']]["第一帧触发的event"] + "||" + events[event_name]['event_name']);
                break;
            case 'Hit':
                rows[events[event_name]['id']]["击中event"] =
                    rows[events[event_name]['id']]["击中event"] == ""
                        ? events[event_name]['event_name']
                        : (rows[events[event_name]['id']]["击中event"].split("||").includes(events[event_name]['event_name'])
                            ? rows[events[event_name]['id']]["击中event"]
                            : rows[events[event_name]['id']]["击中event"] + "||" + events[event_name]['event_name']);
                break;
            case 'Z':
                rows[events[event_name]['id']]["目标区域event"] =
                    rows[events[event_name]['id']]["目标区域event"] == ""
                        ? events[event_name]['event_name']
                        : (rows[events[event_name]['id']]["目标区域event"].split("||").includes(events[event_name]['event_name'])
                            ? rows[events[event_name]['id']]["目标区域event"]
                            : rows[events[event_name]['id']]["目标区域event"] + "||" + events[event_name]['event_name']);
                break;
            default:
                rows[events[event_name]['id']]["过程技能event"] =
                    rows[events[event_name]['id']]["过程技能event"] == ""
                        ? events[event_name]['event_name'] + "," + events[event_name]['time']
                        : (rows[events[event_name]['id']]["过程技能event"].split("||").includes(events[event_name]['event_name'])
                            ? rows[events[event_name]['id']]["过程技能event"]
                            : rows[events[event_name]['id']]["过程技能event"] + "||" + events[event_name]['event_name'] + "," + events[event_name]['time']);
                break;
        }
    }

    rows = rows.filter(el => el);//去除空元素
    const arrayRows = rows.map((obj) => Object.values(obj));
    const allIds = [...ids, ...oldDataIds];
    //console.log(allIds);
    allIds.forEach((id)=>{
        //console.log(id);
        if(!ids.includes(id)){
            arrayRows.push(oldDataJson[id]);
        }
    });
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');
    worksheet.addRow(['技能ID', '技能说明', '第一帧触发的event', '过程技能event', '击中event', '目标区域event']);
    worksheet.addRows(arrayRows);
    workbook.xlsx.writeFile(outputFilePath);

}
module.exports = mixWavsData;
