import { useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';

const TestSlots = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <MainLayout>
      <PageHeader 
        title="Test Slots Page" 
        subtitle={`Tournament ID: ${id}`}
        showBack={true}
      />
      <div className="container mx-auto p-4">
        <div className="bg-green-500 text-white p-4 rounded">
          <h1>SUCCESS! This is the test slots page</h1>
          <p>Tournament ID from URL: {id}</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default TestSlots;