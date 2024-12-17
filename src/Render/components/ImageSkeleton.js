// components/ImageSkeleton.js
const ImageSkeleton = ({ progress, status, isRendering }) => {
  return (
      <div className="image-skeleton">
          {isRendering && (
            <div className="container-progress">
                <div className="label one" id="progress-label">{status}</div>
                <div className="progress-bar">
                    <div className="progress fill-1" style={{ width: `${progress+10}%` }}>
                        <div className="glow"></div>
                    </div>
                </div>
            </div>
          )}
      </div>
  );
};

export default ImageSkeleton;