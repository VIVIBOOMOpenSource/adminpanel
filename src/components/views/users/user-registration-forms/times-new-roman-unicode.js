import { jsPDF } from 'jspdf';

const callAddFont = function () {
  this.addFileToVFS('Times New Roman-normal.ttf', font);
  this.addFont('Times New Roman-normal.ttf', 'Times New Roman', 'normal');
};
jsPDF.API.events.push(['addFonts', callAddFont]);