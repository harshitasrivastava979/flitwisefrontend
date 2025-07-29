import { useState } from 'react';
import { AlertCircle, CheckCircle, X, ExternalLink } from 'lucide-react';

export default function TroubleshootingGuide({ isVisible, onClose }) {
  const [expandedSteps, setExpandedSteps] = useState([]);

  const toggleStep = (stepIndex) => {
    setExpandedSteps(prev => 
      prev.includes(stepIndex) 
        ? prev.filter(i => i !== stepIndex)
        : [...prev, stepIndex]
    );
  };

  const steps = [
    {
      title: "Check if Backend Server is Running",
      description: "Ensure the Spring Boot backend is started",
      details: [
        "Open a terminal/command prompt",
        "Navigate to the backend directory: cd backend",
        "Run: ./mvnw spring-boot:run (Linux/Mac) or mvnw.cmd spring-boot:run (Windows)",
        "Wait for the server to start (you should see 'Started SplitwiseApplication')",
        "The backend should be accessible at http://localhost:8080"
      ]
    },
    {
      title: "Check Database Connection",
      description: "Verify PostgreSQL database is running and accessible",
      details: [
        "Ensure PostgreSQL is installed and running",
        "Check if database 'splitwise_db' exists",
        "Verify database credentials in application.properties",
        "Default credentials: username=postgres, password=postgres"
      ]
    },
    {
      title: "Check Network and Ports",
      description: "Ensure port 8080 is not blocked or in use",
      details: [
        "Check if port 8080 is available: netstat -an | grep 8080",
        "Ensure firewall is not blocking the port",
        "Try accessing http://localhost:8080/actuator/health in browser",
        "If port 8080 is in use, change it in application.properties"
      ]
    },
    {
      title: "Check Browser Console",
      description: "Look for detailed error messages",
      details: [
        "Open browser developer tools (F12)",
        "Go to Console tab",
        "Look for red error messages",
        "Check Network tab for failed requests",
        "Common errors: CORS, connection refused, timeout"
      ]
    },
    {
      title: "Restart Both Frontend and Backend",
      description: "Sometimes a fresh start resolves issues",
      details: [
        "Stop the backend server (Ctrl+C)",
        "Stop the frontend server (Ctrl+C)",
        "Clear browser cache and localStorage",
        "Restart backend first: ./mvnw spring-boot:run",
        "Then restart frontend: npm run dev"
      ]
    }
  ];

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-orange-500" />
              <h2 className="text-xl font-bold text-gray-900">Troubleshooting Guide</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            Follow these steps to resolve backend connection issues
          </p>
        </div>

        <div className="p-6 space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleStep(index)}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                    <span className="text-teal-600 font-semibold text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
                <ChevronRight 
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    expandedSteps.includes(index) ? 'rotate-90' : ''
                  }`} 
                />
              </button>
              
              {expandedSteps.includes(index) && (
                <div className="px-4 pb-4">
                  <ul className="space-y-2">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start space-x-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Still having issues?</h3>
              <p className="text-sm text-gray-600">Check the console logs for detailed error messages</p>
            </div>
            <button
              onClick={() => window.open('https://github.com/your-repo/issues', '_blank')}
              className="flex items-center space-x-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Report Issue</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 