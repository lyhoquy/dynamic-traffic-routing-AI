/**
 * Hook này không còn cần thiết vì geolocation đã được
 * tích hợp trực tiếp vào useMap thông qua GeolocateControl.
 * Giữ lại file rỗng để tránh lỗi import nếu còn reference.
 */
export function useGeolocation() {
  // Geolocation giờ được xử lý bởi GeolocateControl trong useMap.ts
  // GeolocateControl.on('geolocate') cập nhật trực tiếp vào mapStore.
}
