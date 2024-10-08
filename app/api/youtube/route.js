import { google }  from 'googleapis';


const authKey = process.env.YOUTUBE_KEY


export async function POST(request) {
    const yt = google.youtube('v3')  
    const req = await request.json()
    console.log(req)

    const response = await yt.videos.list({
      auth: authKey,
      part: 'id,snippet,contentDetails,statistics',
      id: req.videoId,
    });

    const vData = response.data.items
    let ymltext = ''
    if ( vData.length > 0 ) {
      ymltext += '---\n'
      ymltext += `template: post \n`
      ymltext += `title: "${ vData[0]?.snippet?.title }" \n`
      ymltext += `date: ${ vData[0]?.snippet?.publishedAt } \n`
      ymltext += `tag: [] \n`
      ymltext += `category: [] \n`
      ymltext += `author: auto \n`
      ymltext += `videoID: ${req.videoId} \n`
      ymltext += `subTitle: ${req.videoId}.vtt \n`
      ymltext += '---\n'
      ymltext += vData[0]?.snippet?.description
      
    }

    return Response.json( { text: ymltext } )
  
}