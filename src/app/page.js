import Dashboard from './Components/Dashboard';

export default function Page() {

  return (
    <>
      <Dashboard baseURL={process.env.BASE_URL} />
    </>
  );
}
