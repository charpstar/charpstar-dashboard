const SkeletonRow = () => {
    return (
      <tr>
        <td><div className="skeleton skeleton-thumbnail"></div></td>
        <td><div className="skeleton skeleton-text"></div></td>
        <td><div className="skeleton skeleton-link"></div></td>
        <td><div className="skeleton skeleton-button"></div></td>
      </tr>
    );
  };
  
  export default SkeletonRow;