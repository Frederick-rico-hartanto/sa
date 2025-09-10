import { NextPage } from 'next';
import { useRouter } from 'next/router';
import EditUserModule from '@modules/edituser/module'; // Adjust this import if necessary

const EditUserPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  if (!id) return null; // Optionally, handle case where id is undefined initially

  return <EditUserModule />;
};

export default EditUserPage;
