import { useNavigate } from 'react-router-dom';
import { ShaderLoader } from '@/components/ShaderLoader';
import { useAssessment } from '@/contexts/AssessmentContext';

export default function Generating() {
  const navigate = useNavigate();
  const { setStage } = useAssessment();

  const handleComplete = () => {
    setStage('dashboard');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <ShaderLoader onComplete={handleComplete} />
    </div>
  );
}
