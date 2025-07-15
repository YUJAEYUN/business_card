'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InteractiveZone } from '@/lib/ocr/types';

interface ZoneEditorProps {
  imageUrl: string;
  zones: InteractiveZone[];
  onZonesChange: (zones: InteractiveZone[]) => void;
  cardSide: 'front' | 'back';
  className?: string;
}

interface DragState {
  isDragging: boolean;
  isResizing: boolean;
  dragType: 'move' | 'resize' | null;
  startX: number;
  startY: number;
  zoneId: string | null;
  resizeHandle: string | null;
}

export default function ZoneEditor({
  imageUrl,
  zones,
  onZonesChange,
  cardSide,
  className = ''
}: ZoneEditorProps) {
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    isResizing: false,
    dragType: null,
    startX: 0,
    startY: 0,
    zoneId: null,
    resizeHandle: null
  });
  const [newZone, setNewZone] = useState<Partial<InteractiveZone> | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // 이미지 로드 시 크기 저장
  const handleImageLoad = useCallback(() => {
    if (imageRef.current) {
      setImageSize({
        width: imageRef.current.clientWidth,
        height: imageRef.current.clientHeight
      });
    }
  }, []);

  // 마우스 좌표를 이미지 상대 좌표로 변환
  const getRelativeCoordinates = useCallback((clientX: number, clientY: number) => {
    if (!imageRef.current) return { x: 0, y: 0 };
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100; // 퍼센트로 변환
    const y = ((clientY - rect.top) / rect.height) * 100;
    
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  }, []);

  // 새 존 생성 시작
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target !== imageRef.current) return;
    
    const { x, y } = getRelativeCoordinates(e.clientX, e.clientY);
    
    setIsCreating(true);
    setNewZone({
      id: crypto.randomUUID(),
      type: 'custom',
      coordinates: {
        x,
        y,
        width: 0,
        height: 0,
        side: cardSide
      },
      data: {
        value: '',
        label: 'New Zone'
      }
    });
  }, [getRelativeCoordinates, cardSide]);

  // 새 존 크기 조정
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isCreating || !newZone) return;
    
    const { x, y } = getRelativeCoordinates(e.clientX, e.clientY);
    const startX = newZone.coordinates!.x;
    const startY = newZone.coordinates!.y;
    
    setNewZone(prev => ({
      ...prev,
      coordinates: {
        ...prev!.coordinates!,
        width: Math.abs(x - startX),
        height: Math.abs(y - startY),
        x: Math.min(x, startX),
        y: Math.min(y, startY)
      }
    }));
  }, [isCreating, newZone, getRelativeCoordinates]);

  // 새 존 생성 완료
  const handleMouseUp = useCallback(() => {
    if (isCreating && newZone && newZone.coordinates) {
      const { width, height } = newZone.coordinates;
      
      // 최소 크기 검증
      if (width > 2 && height > 2) {
        const updatedZones = [...zones, newZone as InteractiveZone];
        onZonesChange(updatedZones);
        setSelectedZoneId(newZone.id!);
      }
    }
    
    setIsCreating(false);
    setNewZone(null);
  }, [isCreating, newZone, zones, onZonesChange]);

  // 존 선택
  const handleZoneClick = useCallback((zoneId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedZoneId(selectedZoneId === zoneId ? null : zoneId);
  }, [selectedZoneId]);

  // 존 삭제
  const handleDeleteZone = useCallback((zoneId: string) => {
    const updatedZones = zones.filter(zone => zone.id !== zoneId);
    onZonesChange(updatedZones);
    setSelectedZoneId(null);
  }, [zones, onZonesChange]);

  // 존 타입 변경
  const handleZoneTypeChange = useCallback((zoneId: string, type: InteractiveZone['type']) => {
    const updatedZones = zones.map(zone => 
      zone.id === zoneId ? { ...zone, type } : zone
    );
    onZonesChange(updatedZones);
  }, [zones, onZonesChange]);

  // 존 데이터 변경
  const handleZoneDataChange = useCallback((zoneId: string, data: Partial<InteractiveZone['data']>) => {
    const updatedZones = zones.map(zone => 
      zone.id === zoneId ? { ...zone, data: { ...zone.data, ...data } } : zone
    );
    onZonesChange(updatedZones);
  }, [zones, onZonesChange]);

  const getZoneTypeColor = (type: InteractiveZone['type']) => {
    switch (type) {
      case 'phone': return 'border-green-500 bg-green-500/20';
      case 'email': return 'border-red-500 bg-red-500/20';
      case 'website': return 'border-blue-500 bg-blue-500/20';
      case 'address': return 'border-yellow-500 bg-yellow-500/20';
      case 'social': return 'border-purple-500 bg-purple-500/20';
      default: return 'border-gray-500 bg-gray-500/20';
    }
  };

  const getZoneTypeIcon = (type: InteractiveZone['type']) => {
    switch (type) {
      case 'phone': return '📞';
      case 'email': return '📧';
      case 'website': return '🌐';
      case 'address': return '📍';
      case 'social': return '👥';
      default: return '📝';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Interactive Zones Editor
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {zones.filter(z => z.coordinates.side === cardSide).length} zones
          </span>
          <div className="w-4 h-4 bg-blue-500/20 border border-blue-500 rounded"></div>
          <span className="text-xs text-gray-500">Click & drag to create</span>
        </div>
      </div>

      {/* Image Container */}
      <div 
        ref={containerRef}
        className="relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50"
        style={{ minHeight: '400px' }}
      >
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Business card"
          className="w-full h-auto max-w-full"
          onLoad={handleImageLoad}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ cursor: isCreating ? 'crosshair' : 'default' }}
        />

        {/* Existing Zones */}
        {zones
          .filter(zone => zone.coordinates.side === cardSide)
          .map(zone => (
            <motion.div
              key={zone.id}
              className={`absolute border-2 cursor-pointer transition-all ${
                getZoneTypeColor(zone.type)
              } ${selectedZoneId === zone.id ? 'ring-2 ring-blue-400' : ''}`}
              style={{
                left: `${zone.coordinates.x}%`,
                top: `${zone.coordinates.y}%`,
                width: `${zone.coordinates.width}%`,
                height: `${zone.coordinates.height}%`,
              }}
              onClick={(e) => handleZoneClick(zone.id!, e)}
              whileHover={{ scale: 1.02 }}
              layout
            >
              {/* Zone Label */}
              <div className="absolute -top-6 left-0 bg-white px-2 py-1 text-xs font-medium rounded shadow-sm border">
                <span className="mr-1">{getZoneTypeIcon(zone.type)}</span>
                {zone.type}
              </div>

              {/* Resize Handles */}
              {selectedZoneId === zone.id && (
                <>
                  <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full cursor-nw-resize"></div>
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full cursor-ne-resize"></div>
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full cursor-sw-resize"></div>
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full cursor-se-resize"></div>
                </>
              )}
            </motion.div>
          ))}

        {/* New Zone Being Created */}
        {isCreating && newZone && newZone.coordinates && (
          <div
            className="absolute border-2 border-blue-500 bg-blue-500/20"
            style={{
              left: `${newZone.coordinates.x}%`,
              top: `${newZone.coordinates.y}%`,
              width: `${newZone.coordinates.width}%`,
              height: `${newZone.coordinates.height}%`,
            }}
          />
        )}
      </div>

      {/* Zone Properties Panel */}
      <AnimatePresence>
        {selectedZoneId && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-gray-50 rounded-lg border"
          >
            {(() => {
              const selectedZone = zones.find(z => z.id === selectedZoneId);
              if (!selectedZone) return null;

              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Zone Properties</h4>
                    <button
                      onClick={() => handleDeleteZone(selectedZoneId)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete Zone
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Zone Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        value={selectedZone.type}
                        onChange={(e) => handleZoneTypeChange(selectedZoneId, e.target.value as InteractiveZone['type'])}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="phone">Phone</option>
                        <option value="email">Email</option>
                        <option value="website">Website</option>
                        <option value="address">Address</option>
                        <option value="social">Social</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>

                    {/* Zone Value */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Value
                      </label>
                      <input
                        type="text"
                        value={selectedZone.data.value}
                        onChange={(e) => handleZoneDataChange(selectedZoneId, { value: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter the clickable value"
                      />
                    </div>

                    {/* Zone Label */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Label
                      </label>
                      <input
                        type="text"
                        value={selectedZone.data.label || ''}
                        onChange={(e) => handleZoneDataChange(selectedZoneId, { label: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Display label (optional)"
                      />
                    </div>

                    {/* Coordinates Info */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Position
                      </label>
                      <div className="text-sm text-gray-600">
                        X: {selectedZone.coordinates.x.toFixed(1)}%, 
                        Y: {selectedZone.coordinates.y.toFixed(1)}%<br/>
                        W: {selectedZone.coordinates.width.toFixed(1)}%, 
                        H: {selectedZone.coordinates.height.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Instructions:</strong></p>
        <ul className="list-disc list-inside space-y-1 mt-1">
          <li>Click and drag on the image to create a new interactive zone</li>
          <li>Click on existing zones to select and edit them</li>
          <li>Use the properties panel to configure zone type and data</li>
          <li>Zones will be clickable in the final business card view</li>
        </ul>
      </div>
    </div>
  );
}
