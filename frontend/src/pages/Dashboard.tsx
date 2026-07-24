import { useState } from "react";
import Navbar from "../components/Navbar";
import UploadBox from "../components/UploadBox";
import DocumentList from "../components/DocumentList";
import ChatWindow from "../components/ChatWindow";

interface Document {
  id: number;
  filename: string;
}

export default function Dashboard() {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [refresh, setRefresh] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          
          {/* Left Panel */}
          <div className="col-span-4">
            <UploadBox
              onUploadSuccess={() => setRefresh(!refresh)}
            />

            <DocumentList
              selectedDocument={selectedDocument}
              onSelect={setSelectedDocument}
              refresh={refresh}
            />
          </div>

          {/* Right Panel */}
          <div className="col-span-8">
            <ChatWindow
              document={selectedDocument}
            />
          </div>

        </div>
      </div>
    </div>
  );
}