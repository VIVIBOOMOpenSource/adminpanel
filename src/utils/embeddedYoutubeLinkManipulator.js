export default function getEmbedYoutubeLink(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
  
    var videoId = match && match[2].length === 11 ? match[2] : null;
  
    return "https://youtube.com/embed/" + videoId;
  };
  