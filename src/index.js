const { QMainWindow, QWidget, QMimeData, QLabel, FlexLayout, QPushButton, QIcon, WidgetEventTypes, QDragMoveEvent, QDragLeaveEvent, QDropEvent } = require('@nodegui/nodegui');
const win = new QMainWindow();
const findFirstTimeAboveThreshold = require('./timeAboveThreshold.js');
const wavSlice = require('./wavSlice.js');
const mixWavsData = require('./outputCSV.js');
const path = require('path');

win.setWindowTitle("WavSlice");

const centralWidget = new QWidget();
centralWidget.setObjectName("myroot");
const rootLayout = new FlexLayout();
centralWidget.setLayout(rootLayout);
centralWidget.setAcceptDrops(true);

//data
let wavsData = [];
async function processWavsData(wavsData) {
  for (let i = 0; i < wavsData.length; i++) {
    const time = await findFirstTimeAboveThreshold(wavsData[i].wavpath, -48);
    if (time !== null) {
      wavsData[i].time = time.toFixed(3);
    } else {
      wavsData[i].time = 0;
    }
  }
  fileCountLabel.setText(`Dropped files: ${droppedFileCount} 扫描完毕`);
  console.log(wavsData);
}

const events = [
  { type: WidgetEventTypes.DragEnter, handler: e => new QDragMoveEvent(e) },
  { type: WidgetEventTypes.DragMove, handler: e => new QDragMoveEvent(e) },
  { type: WidgetEventTypes.DragLeave, handler: e => new QDragLeaveEvent(e) },
];
centralWidget.addEventListener(WidgetEventTypes.Drop, event => {
  const dropEvent = new QDropEvent(event);
  let mimeData = dropEvent.mimeData();
  let urls = mimeData.urls();
  for (let url of urls) {
    let str = url.toString();
    let wavPath = {"wavpath": str.replace('file:///', ''), "time": -1};
    if(!wavsData.some(item => item.wavpath === wavPath.wavpath)){
      wavsData.push(wavPath);
      droppedFileCount = urls.length;
    }
    console.log(wavsData); //Example of inspection of dropped data.

  }
  fileCountLabel.setText(`Dropped files: ${droppedFileCount}`);
});
let droppedFileCount = 0;
events.forEach(({ type, handler }) => {
  centralWidget.addEventListener(type, e => {
    const event = handler(e);
    //console.log(type, event);
    event.accept();
  });
});

const createLabel = (text, style = '') => {
  const label = new QLabel();
  label.setText(text);
  label.setInlineStyle(style);
  return label;
};
//buttons
//Scan button
const scanbutton = new QPushButton();
scanbutton.setText("Scan");
scanbutton.addEventListener('clicked', async () => {
  if (wavsData.length > 0) {
    await processWavsData(wavsData);
  } else {
    console.log('no files dropped');
  }
});

//Slice button
const slicebutton = new QPushButton();
slicebutton.setText("Slice");
slicebutton.addEventListener('clicked', async () => {
  if (wavsData.length > 0) {
    for (let i = 0; i < wavsData.length; i++) {
      await wavSlice(wavsData[i].time, wavsData[i].wavpath, "./wavOutput/" + path.basename(wavsData[i].wavpath.toString()));
    }
  } else {
    console.log('no files dropped');
  }
});

//Output CSV button
const outputCSVbutton = new QPushButton();
outputCSVbutton.setText("Output CSV");
outputCSVbutton.addEventListener('clicked', () => {
  if (wavsData.length > 0) { 
    try {
      mixWavsData(wavsData);
    } catch (e) { 
      win.alert(e);
    }
  }
});


//Clear button
const clearButton = new QPushButton();
clearButton.setText("Clear");
clearButton.addEventListener('clicked', () => {
  wavsData= [];
  droppedFileCount = 0;
  fileCountLabel.setText(`Dropped files: ${droppedFileCount}`);
  console.log('cleared');
});

//labels
const label1 = createLabel('Drop Your Wavs In the window', 'font-size: 16px; font-weight: bold; padding: 1;');
const fileCountLabel = new QLabel();
fileCountLabel.setObjectName("fileCountLabel");
fileCountLabel.setText("Dropped files: 0");

rootLayout.addWidget(label1);
rootLayout.addWidget(scanbutton);
rootLayout.addWidget(slicebutton);
rootLayout.addWidget(outputCSVbutton);
rootLayout.addWidget(clearButton);
rootLayout.addWidget(fileCountLabel);

win.setCentralWidget(centralWidget);
win.setStyleSheet(`
  #myroot {
    background-color: #009688;
    height: '300px';
    width: '600px';
    align-items: 'center';
    justify-content: 'center';
  }
  #mylabel {
    font-size: 16px;
    font-size: 16px;
    padding: 1;
  }
  #scanbutton {font-size: 16px;font-size: 16px;}
  #slicebutton {font-size: 16px;font-size: 16px;}
  #outputCSVbutton {font-size: 16px;font-size: 16px;}
`);

win.show();

global.win = win;

module.exports = wavsData;
