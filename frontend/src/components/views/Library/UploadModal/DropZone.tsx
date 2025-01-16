import React, { forwardRef } from 'react';
import { Upload } from 'lucide-react';
import { DropzoneRootProps } from 'react-dropzone';

interface DropZoneProps extends DropzoneRootProps {
  isDragActive: boolean;
}

const DropZone = forwardRef<HTMLDivElement, DropZoneProps>(
  ({ isDragActive, ...rootProps }, ref) => (
    <div 
      {...rootProps} 
      ref={ref}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-emerald-400 bg-emerald-50' : 'border-gray-300 hover:border-emerald-400'}`}
    >
      <Upload className="mx-auto h-12 w-12 text-gray-400" />
      <p className="mt-2 text-sm text-gray-600">
        {isDragActive ? 'Drop files here' : 'Drag and drop files here, or click to select files'}
      </p>
    </div>
  )
);

DropZone.displayName = 'DropZone';

export default DropZone;