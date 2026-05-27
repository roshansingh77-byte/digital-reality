# Document Upload Feature Documentation

## Overview

The Document Upload feature allows users to upload, manage, and organize documents associated with projects. Users can upload documents via:
- **Camera**: Capture photos directly from the device camera
- **Local Drive**: Select files from the device's file system

## Supported Document Types

The system supports the following document types:

| Type | Description | Supported Formats |
|------|-------------|------------------|
| **PO** | Purchase Orders | PDF, DOC, DOCX, XLS, XLSX |
| **Site Permit** | Site Permits | PDF, DOC, DOCX, JPG, PNG |
| **Report** | Project Reports | PDF, DOC, DOCX, XLS, XLSX |
| **Drawing** | Technical Drawings | PDF, DWG, JPG, PNG |
| **Photo** | Photos/Images | JPG, JPEG, PNG, GIF, BMP |
| **Other** | Other Document Types | Any format |

## Architecture

### Components

1. **DocumentsTab** (`components/DocumentsTab.tsx`)
   - Main component for the Documents tab in project details
   - Handles camera and file uploads
   - Displays list of uploaded documents
   - Manages document deletion

2. **DocumentViewer** (`components/DocumentViewer.tsx`)
   - Displays detailed information about a document
   - Allows viewing and sharing of documents
   - Shows document metadata (size, upload date, uploader, etc.)

### Data Model

```typescript
interface Document {
  id: string;                    // Unique document identifier
  projectId: string;             // Associated project ID
  name: string;                  // Document filename
  type: DocumentType;            // Category of document
  status: DocumentStatus;        // Upload/Processing status
  filePath: string;              // Local storage path
  fileSize: number;              // File size in bytes
  mimeType: string;              // MIME type of the file
  uploadedBy: string;            // Name of user who uploaded
  uploadedAt: string;            // ISO timestamp of upload
  description?: string;          // Optional description
}
```

### Storage

Documents are stored in the device's document directory:
```
${FileSystem.documentDirectory}/documents/{uuid}_{filename}
```

This structure ensures:
- Organized file storage
- Unique file naming to prevent conflicts
- Easy cleanup when documents are deleted

## Usage Guide

### For End Users

1. **Navigate to Project Details**
   - Open a project from the dashboard
   - Tap on the "Documents" tab

2. **Upload a Document**
   - **Camera**: Tap "Capture Photo" to take a photo directly
   - **File**: Tap "Select File" to choose from device storage

3. **View Document List**
   - All uploaded documents are displayed with:
     - Document name and type
     - File size
     - Upload date and uploader
     - Quick delete option

4. **Delete a Document**
   - Tap the trash icon on any document
   - Confirm deletion when prompted

### For Developers

#### Adding a New Document

```typescript
import { generateId } from "@/lib/documentUtils";

const doc: Document = {
  id: generateId(),
  projectId: "p1",
  name: "document.pdf",
  type: "Report",
  status: "Uploaded",
  filePath: "/path/to/file",
  fileSize: 1024000,
  mimeType: "application/pdf",
  uploadedBy: "John Doe",
  uploadedAt: new Date().toISOString(),
  description: "Monthly project report"
};

addDocument(doc);
```

#### Getting Project Documents

```typescript
const { getProjectDocuments } = useApp();
const projectDocs = getProjectDocuments("p1");
```

#### Deleting a Document

```typescript
const { deleteDocument } = useApp();
deleteDocument(documentId);
```

## Utility Functions

Located in `lib/documentUtils.ts`:

### `generateId(): string`
Generates a UUID v4 format identifier without external dependencies.

### `getMimeType(filename: string): string`
Returns the appropriate MIME type for a file based on its extension.

### `getDocumentType(filename: string): DocumentType`
Auto-detects the document type based on file extension.

### `copyFileToDocumentsDir(sourceUri: string, filename: string): Promise<string>`
Copies a file from source URI to the documents directory and returns the destination path.

### `getFileInfo(uri: string): Promise<{size: number, filename: string}>`
Retrieves file information including size and name.

### `formatFileSize(bytes: number): string`
Formats file size for human-readable display (B, KB, MB, GB).

### `getFileIcon(filename: string): string`
Returns the appropriate Feather icon name for a document type.

## Permissions

The feature requires the following permissions:

### iOS
```xml
<key>NSCameraUsageDescription</key>
<string>Camera access is needed to capture photos</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Photo library access is needed to select documents</string>
```

### Android
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

These permissions are handled by `expo-image-picker` automatically.

## Features

### Current Implementation
✅ Camera photo capture
✅ File selection from device storage
✅ Document listing and management
✅ File size and metadata display
✅ Document type detection
✅ Document deletion
✅ Local storage persistence (AsyncStorage)

### Planned Features
🔄 Document sharing
🔄 Document preview (PDF, images)
🔄 Document search and filtering
🔄 Batch upload
🔄 Cloud storage sync
🔄 Document versioning
🔄 OCR text extraction
🔄 Digital signatures

## Error Handling

The feature includes comprehensive error handling:
- Permission denial alerts
- File not found errors
- Upload failure messages
- Network/storage errors

All errors are displayed to users with actionable messages.

## Performance Considerations

1. **Large Files**: Files are copied to local storage, consuming device space
2. **Image Optimization**: Photos are compressed to 80% quality to reduce file size
3. **Async Operations**: All file operations are asynchronous to prevent UI blocking

## Testing

### Manual Testing Checklist

- [ ] Camera capture works on physical device
- [ ] File selection opens file picker correctly
- [ ] Documents persist after app restart
- [ ] Documents appear in the list with correct metadata
- [ ] Delete functionality removes files and updates UI
- [ ] Multiple documents can be uploaded for same project
- [ ] Different file types are handled correctly
- [ ] Large files (>50MB) are handled gracefully
- [ ] Permission denial is handled properly

## Troubleshooting

### Documents not appearing after upload
- Check AsyncStorage permissions
- Verify document directory exists
- Check file system permissions

### Camera not working
- Ensure camera permission is granted
- On iOS, check NSCameraUsageDescription in app.json
- Verify device camera is functional

### File picker not opening
- Check file system permissions
- On Android, verify WRITE_EXTERNAL_STORAGE permission
- Test with different file types

## API Integration (Future)

When backend is ready, add these endpoints:

```
POST   /api/documents              - Create document
GET    /api/documents?projectId=p1 - List project documents
GET    /api/documents/{id}         - Get document details
DELETE /api/documents/{id}         - Delete document
POST   /api/documents/{id}/share   - Share document
```

## Related Components

- `ProjectDetail.tsx` - Project detail view with tabs
- `AppContext.tsx` - Global state management
- `useColors.ts` - Theme/color management

## Dependencies

- `expo-image-picker`: For camera and file selection
- `expo-file-system`: For file operations
- `@react-native-async-storage/async-storage`: For local storage
- `react-native`: Core UI components
- `@expo/vector-icons`: Icon library (Feather)
