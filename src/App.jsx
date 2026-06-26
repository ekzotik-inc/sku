import { useAppStore } from './store/appStore';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import AnalysisPage from './components/AnalysisPage';
import SettingsPage from './components/SettingsPage';
import SettingsLock from './components/SettingsLock';
import StoreModal from './components/StoreModal';
import Toast from './components/Toast';

export default function App() {
  const { activeTab, report } = useAppStore();

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <Header />
      <main>
        {activeTab === 'settings' && (
          <SettingsLock>
            <SettingsPage />
          </SettingsLock>
        )}
        {activeTab === 'dashboard' && (report ? <Dashboard /> : <FileUpload />)}
        {activeTab === 'analysis' && (report ? <AnalysisPage /> : <FileUpload />)}
      </main>
      <StoreModal />
      <Toast />
    </div>
  );
}
