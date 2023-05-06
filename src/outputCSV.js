const fs = require('fs');
const path = require('path');
const csvWriter = require('csv-writer').createObjectCsvWriter;
const wavsData = require('./index.js');
const ExcelJS = require('exceljs');
const { flatMapDeep } = require('lodash');
const XLSX = require('xlsx');

const directoryPath = './wavOutput';
const outputFilePath = './csvTable/Output/Output.xlsx';

async function oldXlsxToJson() {
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();

    // 读取 Excel 文件
    await workbook.xlsx.readFile(outputFilePath);

    // 获取第一个 sheet
    const worksheet = workbook.worksheets[0];

    // 将所有行的数据存储为数组
    const oldRows = worksheet.getSheetValues();
    // 打印数组
    console.log(oldRows);

}

async function mixWavsData(data) {
    oldXlsxToJson()
    const events = {};
    data.forEach((obj) => {
        const filePath = obj.wavpath;
        const fileName = path.parse(filePath).name;
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
    console.log(events);
    console.log(arrayRows);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');
    worksheet.addRow(['技能ID', '技能说明', '第一帧触发的event', '过程技能event', '击中event', '目标区域event']);
    worksheet.addRows(arrayRows);
    workbook.xlsx.writeFile(outputFilePath);

}
module.exports = mixWavsData;
