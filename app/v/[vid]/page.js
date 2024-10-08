import SubPlayer from "../../components/subPlayer"

export default function Page( {params}) {

  return (
    <div className="font-mono">
      <main className="">
        <SubPlayer videoId={params.vid} />
      </main>
    </div>
  );
}
