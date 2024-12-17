import React, { useState } from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";



const ImageGallery = ({ images, isLoading }) => {
  const [mainSlider, setMainSlider] = useState(null);
  const [navSlider, setNavSlider] = useState(null);
  

  // Main slider settings
  const mainSettings = {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true, // Assuming you don't want arrows on the main slider
    fade: true, // Optional: nice effect for the main slider
    asNavFor: navSlider, // Linking the main slider to the nav (thumbnail) slider
  };

  // Thumbnail slider settings
  const navSettings = {
    slidesToShow: 3, // Number of thumbnails to show
    slidesToScroll: 1,
    asNavFor: mainSlider, // Linking the nav slider to the main slider
    dots: false,
    centerMode: true,
    focusOnSelect: true,
    arrows: false, // Optional: if you want arrows on your thumbnail slider
  };

  // Dynamically create image URLs based on articleId (adjust as necessary)



return (
    
    <div className="galleries position-relative">
      <div className="slick-slider slider-for" data-slick-options="settingsMain">

        <Slider {...mainSettings} ref={slider => setMainSlider(slider)}>
          {images.map((img, idx) => (
            <div className="box" key={idx}>
              <div className="p-0 d-flex border-0">
                <img src={img} className="card-img ratio ratio-1-1 bg-img-cover-center" alt={`Slide ${idx}`} style={{ width: "100%" }} />
              </div>
            </div>
     ))}
        </Slider>
 
      </div>
      <div className="slick-slider slider-nav mt-1 mx-n1" data-slick-options="settingsThumbs">
        <Slider {...navSettings} ref={slider => setNavSlider(slider)}>
          {images.map((img, idx) => (
            <div key={idx} className="p-1 h-100">
              <img src={img} alt={`Thumbnail ${idx}`} style={{ width: "100%" }} />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default ImageGallery;