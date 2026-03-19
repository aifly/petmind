'use client';

import { useState, useEffect } from 'react';
import { MapPin, Search, ChevronLeft, Navigation, Phone, Clock, Star, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

interface Hospital {
  id: string;
  name: string;
  address: string;
  distance?: string;
  phone?: string;
  hours?: string;
  rating?: number;
  latitude?: number;
  longitude?: number;
}

interface NearbyHospitalsProps {
  onBack: () => void;
}

export default function NearbyHospitals({ onBack }: NearbyHospitalsProps) {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchRadius, setSearchRadius] = useState(5); // km
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [keyword, setKeyword] = useState('');
  const [permissionDenied, setPermissionDenied] = useState(false);

  const getLocation = () => {
    setLoading(true);
    setPermissionDenied(false);
    
    if (!navigator.geolocation) {
      toast.error('您的浏览器不支持定位功能');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        // 模拟附近医院数据（实际需要调用地图API）
        setHospitals(generateMockHospitals(position.coords.latitude, position.coords.longitude));
        setLoading(false);
      },
      (error) => {
        console.error('定位失败:', error);
        setPermissionDenied(true);
        setLoading(false);
        // 使用默认位置（上海）
        const defaultLat = 31.2304;
        const defaultLng = 121.4737;
        setLocation({ lat: defaultLat, lng: defaultLng });
        setHospitals(generateMockHospitals(defaultLat, defaultLng));
        toast.error('无法获取定位，显示默认地区');
      }
    );
  };

  const generateMockHospitals = (lat: number, lng: number): Hospital[] => {
    const names = [
      '萌宠宠物医院',
      '爱康宠物诊所',
      '汪星人宠物中心',
      '喵星人宠物医院',
      '宠物天使诊所',
      '毛孩子健康中心',
      '宠颐宠物医院',
      '芭比堂宠物医院',
    ];
    
    const addresses = [
      '上海市浦东新区世纪大道100号',
      '上海市静安区南京西路1688号',
      '上海市徐汇区漕溪北路88号',
      '上海市长宁区中山公园对面',
      '上海市杨浦区五角场商圈',
      '上海市虹口区四川北路',
      '上海市普陀区中山北路',
      '上海市闸北区共和新路',
    ];

    return names.map((name: string, index: number) => ({
      id: `hospital-${index}`,
      name,
      address: addresses[index],
      distance: `${(Math.random() * 5 + 0.5).toFixed(1)}km`,
      phone: `400-${Math.floor(Math.random() * 9000 + 1000)}-${Math.floor(Math.random() * 9000 + 1000)}`,
      hours: '24小时营业',
      rating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
      latitude: lat + (Math.random() - 0.5) * 0.02,
      longitude: lng + (Math.random() - 0.5) * 0.02,
    }));
  };

  const openNavigation = (hospital: Hospital) => {
    if (hospital.latitude && hospital.longitude) {
      // 尝试使用高德地图或百度地图
      const gaodeUrl = `https://uri.amap.com/marker?position=${hospital.longitude},${hospital.latitude}&name=${encodeURIComponent(hospital.name)}&coordinate=gaode&callnative=0`;
      const baiduUrl = `http://api.map.baidu.com/marker?location=${hospital.latitude},${hospital.longitude}&title=${encodeURIComponent(hospital.name)}&content=${encodeURIComponent(hospital.address)}&output=html&src=webapp.baidu.openAPIdemo`;
      
      // 优先尝试高德
      window.open(gaodeUrl, '_blank');
    }
  };

  const filteredHospitals = keyword
    ? hospitals.filter(h => h.name.includes(keyword) || h.address.includes(keyword))
    : hospitals;

  useEffect(() => {
    getLocation();
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-900 px-6 py-5">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="返回"
            >
              <ChevronLeft className="w-5 h-5 text-gray-300" />
            </button>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                附近宠物医院
              </h2>
              <p className="text-gray-400 text-sm">查找附近的宠物诊所和医院</p>
            </div>
          </div>
        </div>

        {/* Location Status */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${location ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className="text-sm text-gray-600">
                {location ? '定位成功' : loading ? '定位中...' : '定位失败'}
              </span>
            </div>
            <button
              onClick={getLocation}
              disabled={loading}
              className="text-sm text-amber-600 hover:text-amber-700 font-medium"
            >
              {loading ? '刷新中...' : '重新定位'}
            </button>
          </div>
          
          {permissionDenied && (
            <p className="text-xs text-orange-500 mt-2">
              ⚠️ 定位权限被拒绝，已使用默认位置
            </p>
          )}
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索医院名称..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none text-gray-900"
            />
          </div>
        </div>

        {/* Hospital List */}
        <div className="max-h-[60vh] overflow-y-auto">
          {filteredHospitals.length === 0 ? (
            <div className="p-12 text-center">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">暂无附近的宠物医院</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredHospitals.map((hospital) => (
                <div
                  key={hospital.id}
                  onClick={() => setSelectedHospital(hospital)}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{hospital.name}</h3>
                        {hospital.rating && (
                          <span className="flex items-center text-xs text-amber-500">
                            <Star className="w-3 h-3 fill-current mr-0.5" />
                            {hospital.rating}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{hospital.address}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Navigation className="w-3 h-3" />
                          {hospital.distance}
                        </span>
                        {hospital.hours && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {hospital.hours}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronLeft className="w-5 h-5 text-gray-300 rotate-180" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hospital Detail Modal */}
      {selectedHospital && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={() => setSelectedHospital(null)}>
          <div 
            className="bg-white rounded-t-2xl w-full max-w-2xl mx-auto p-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{selectedHospital.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{selectedHospital.address}</p>
              </div>
              <button
                onClick={() => setSelectedHospital(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {selectedHospital.distance && (
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span>距离 {selectedHospital.distance}</span>
                </div>
              )}
              {selectedHospital.phone && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <a href={`tel:${selectedHospital.phone}`} className="text-amber-600 hover:underline">
                    {selectedHospital.phone}
                  </a>
                </div>
              )}
              {selectedHospital.hours && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span>{selectedHospital.hours}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => openNavigation(selectedHospital)}
                className="flex-1 py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 flex items-center justify-center gap-2"
              >
                <Navigation className="w-5 h-5" />
                导航去这里
              </button>
              {selectedHospital.phone && (
                <a
                  href={`tel:${selectedHospital.phone}`}
                  className="flex-1 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 flex items-center justify-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  拨打电话
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
