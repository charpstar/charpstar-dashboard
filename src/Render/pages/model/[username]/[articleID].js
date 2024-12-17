import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ImageGallery from '../../../components/ImageGallery';
import Link from 'next/link';
import ImageSkeleton from '../../../components/ImageSkeleton';
import RenderOptionsModal from '../../../components/RenderOptionsModal';


export default function ModelPage() {
  const router = useRouter();
  const { username, articleID } = router.query;
  const [productName, setProductName] = useState('');
  // Renamed for clarity to reflect overall rendering progress
  const [renderingProgress, setRenderingProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [jobId, setJobId] = useState(null);
  // Updated placeholder text for clarity
  const [galleryImages, setGalleryImages] = useState(Array(5).fill("https://placehold.co/700x700?text=CharpstAR"));
  const [isQueued, setIsQueued] = useState(false);
  const [renderingStarted, setRenderingStarted] = useState(false);
  const [imagesLoading, setImagesLoading] = useState(true);
  const isRendering = renderingStarted && renderingProgress < 100;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [renderOptions, setRenderOptions] = useState({});



  useEffect(() => {
    const checkRendersAndGLBExist = async () => {
      if (!articleID) return;
      const rendersResponse = await fetch(`/api/check-renders?articleID=${articleID}`);
      const rendersData = await rendersResponse.json();
      if (rendersData.exists) {
        fetchAndUpdateGalleryImages();
      } else {
        const jobIdResponse = await fetch(`/api/get-jobid-by-articleid?articleID=${articleID}`);
        const jobIdData = await jobIdResponse.json();
        if (jobIdData.jobId) {
          console.log (jobIdData.jobId);
         setJobId(jobIdData.jobId);
         checkProgress(jobIdData.jobId);
        } else {
          setShowButton(true);
          setGalleryImages(Array(5).fill("https://placehold.co/700x700?text=CharpstAR"));
          setImagesLoading(false);
        }
      }
    };
  
    checkRendersAndGLBExist();
  }, [articleID]);

  const handleRenderClick = () => {
    setIsModalOpen(true);
  };

  const handleModalSave = (options) => {
    setRenderOptions(options);
    setIsModalOpen(false);
    // Proceed with the rendering process using these options
  };
  // Refactor the progress checking into a separate function for reuse
const checkProgress = async (jobId) => {
  const progressResponse = await fetch(`/api/progress/${jobId}`);
  const progressData = await progressResponse.json();
  if (progressResponse.ok) {
    setRenderingStarted(true);
    setRenderingProgress(progressData.progress || 0);
    setIsUploading(progressData.progress < 0);
    setIsQueued(progressData.progress >= 0 && progressData.progress < 20);
    setShowButton(progressData.progress < 100);

    if (progressData.progress >= 20 && progressData.progress < 100) {
      setIsUploading(false);
      setIsQueued(false);
    }
    // If progress is 100%, update gallery images
    if (progressData.progress === 100) {
      setIsUploading(false);
      setIsQueued(false);
      setShowButton(false);
      fetchAndUpdateGalleryImages();
    }
  } else {
    console.error('Error fetching progress:', progressData.error);
  }
};

  useEffect(() => {
    if (!jobId) return;
    const interval = setInterval(() => {
      checkProgress(jobId);
    }, 1000);
  
    return () => clearInterval(interval);
  }, [jobId]);

  useEffect(() => {
    const storedProductName = sessionStorage.getItem('productName');
    if (storedProductName) {
      setProductName(storedProductName);
    }
  }, []);

  const handleRender = async () => {
    setRenderingStarted(true);
    setIsUploading(true);
    setRenderingProgress(0);
    setImagesLoading(true);
    try {
      const response = await fetch(`https://cdn.charpstar.net/SharkGaming/Android/${articleID}.glb`);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append('file', blob, `${articleID}.glb`);
  
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadResponse.json();
      if (uploadResponse.ok) {
        setJobId(uploadData.jobId);
        setIsQueued(true);
        setIsUploading(false);
      } else {
        console.error('Error uploading file:', uploadData.error);
        setIsUploading(false);
        setShowButton(true);
      }
    } catch (error) {
      console.error('Error fetching file:', error);
      setIsUploading(false);
      setShowButton(true); // Show the button again to allow retry
    }
  };

  const fetchAndUpdateGalleryImages = async () => {
    const response = await fetch(`/api/check-renders?articleID=${articleID}`);
    const data = await response.json();
    if (data.exists) {
      const renderImages = Array.from({ length: 5 }, (_, i) => 
        `https://glb-render.s3.eu-north-1.amazonaws.com/renders/${articleID}-${i + 1}.jpg`);
       setGalleryImages(renderImages);
       setImagesLoading(false);
    }
  };

  // Inside the ModelPage component, determine the status text
let statusText;
if (!renderingStarted) {
  statusText = 'Ready to Render';
} else if (isUploading && renderingProgress === 0) {
  statusText = 'Uploading';
} else if (isQueued) {
  statusText = 'Queued for Rendering';
} else if (renderingProgress === 100) {
  statusText = 'Finishing';
} else {
  statusText = `Rendering... ${renderingProgress+10}%`;
}


  return (
    <div className="h-100 container">
      <div className="py-3 nav">
        <img src="https://js.charpstar.net/Website/images/logo.svg" width="150px"/>
      </div>
      <div className="viewerRendercontainer mainContainer">
        <div className="container-fluid p-2">
          <div className="row">
            <div className="col-md-6 text-center">
            {imagesLoading ? (
             <ImageSkeleton progress={renderingProgress} status={statusText} isRendering={isRendering}  />
              ) : (
                  <ImageGallery images={galleryImages} />
              )}
            </div>
            <div className="col-md-6 px-md-4 px-lg-5">
              <div className='mb-4'>
                <Link href="/dashboard"> 
                  <p className='view-all-models'>View all Models</p>
                </Link>
              </div>
              <p className="client-name text-uppercase mb-3">{username}</p>
              <h4 className='product-name-other'>{productName}</h4>
              <div className="mainCodeArea">
                <p>{username} SKU for Product</p>
                <div className="mt-lg-2 mt-sm-1 mt-3 ">
                  <div className="codeAreaMain ">
                    <pre id="usdzLink">{articleID}</pre>
                  </div>
                  <div className="text-left">*Note: This ID connects the {username} product to our services</div>
                </div>
              </div>
              <button 
                id="render-button" 
                className={`render-button ${isRendering ? 'disabled' : ''}`} 
                onClick={handleRender} 
                disabled={isRendering}
              >
             Render
             </button>
            </div>
          </div>
        </div>
      </div>
    </div> 
  );
}