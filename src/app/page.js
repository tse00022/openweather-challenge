import Maindata from './Components/Maindata';

export default function Page() {

  return (
    <>
      <Maindata baseURL={process.env.BASE_URL} />
    </>
  );
}
