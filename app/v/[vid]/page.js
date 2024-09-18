import SubPlayer from "../../components/subPlayer"

export default function Page( {params}) {

  return (
    <div className="font-[family-name:var(--font-geist-sans)]">
      <main className="">
        <SubPlayer videoId={params.vid} />
      </main>
    </div>
  );
}
