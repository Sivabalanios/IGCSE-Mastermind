
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import TutorRoom from './pages/TutorRoom';
import Resources from './pages/Resources';
import MockExam from './pages/MockExam';
import StudyHub from './pages/StudyHub';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/study-hub" element={<StudyHub />} />
          <Route path="/tutor" element={<TutorRoom />} />
          <Route path="/mock-exam" element={<MockExam />} />
          <Route path="/resources" element={<Resources />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
