import React from 'react';
import { Carousel, Button } from 'react-bootstrap';

const Banner = () => {
  const banners = [
    {
      id: 1,
      title: "Đồng hồ cao cấp - Phong cách hiện đại",
      description: "Khám phá bộ sưu tập đồng hồ mới nhất 2025",
      image: "/image/anhdongho1.jpg",
      link: "/products/collection1",
    },
    {
      id: 2,
      title: "Ưu đãi lên đến 50%",
      description: "Chỉ trong tháng này - Đừng bỏ lỡ!",
      image: "/image/anhdongho2.jpg",
      link: "/products/sale",
    },
    {
      id: 3,
      title: "Bộ sưu tập mới 2025",
      description: "Thiết kế tinh tế, đẳng cấp vượt thời gian",
      image: "/image/anhdongho3.jpg",
      link: "/products/new-collection",
    },
    {
      id: 4,
      title: "Khuyến mãi đặc biệt",
      description: "Giảm giá sốc cho đồng hồ cao cấp",
      image: "/image/anhdongho4.jpg",
      link: "/products/special-offer",
    },
  ];

  return (
    <Carousel fade interval={5000} pause="hover" className="banner-carousel">
      {banners.map((banner) => (
        <Carousel.Item key={banner.id}>
          <div className="banner-overlay" />
          <img
            className="d-block w-100 banner-image"
            src={banner.image}
            alt={banner.title}
            onError={(e) => (e.target.src = 'https://picsum.photos/1920/600?random=1')}
          />
          <Carousel.Caption className="banner-caption">
            <h3>{banner.title}</h3>
            <p>{banner.description}</p>
            <Button variant="primary" href={banner.link} className="banner-button">
              Xem ngay
            </Button>
          </Carousel.Caption>
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default Banner;