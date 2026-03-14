import * as deepl from 'deepl-node'

const authKey = process.env.DEEPL_KEY
const translator = new deepl.Translator(authKey);

export async function POST(request) {
  const tw = await request.json()
  const translated = await translator.translateText(tw.text, null, 'en-US', {split_sentences: 0});
  console.log(tw)
  return Response.json( { text: translated.text } )
}
