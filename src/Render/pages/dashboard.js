import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router'; // Import useRouter
import SkeletonRow from '../components/SkeletonRow'; // Import your skeleton component


export default function Dashboard() {
  const router = useRouter();
  const { data: session } = useSession();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Add a loading state


  useEffect(() => {
    console.log("Session:", session);
    async function fetchProducts() {
      setIsLoading(true); 
      const res = await fetch('/data.json');
      const data = await res.json();
      let clientProducts = data.clients[session?.user?.name] || [];
  
      // Check for the existence of the first render image for each product
      const productsWithImages = await Promise.all(clientProducts.map(async (product) => {
        const renderCheckRes = await fetch(`/api/check-renders?articleID=${product.articleID}`);
        const renderCheckData = await renderCheckRes.json();
        if (renderCheckData.exists) {
          // If renders exist, use the first render image
          product.imageUrl = `https://glb-render.s3.eu-north-1.amazonaws.com/renders/${product.articleID}-1.jpg`;
        } else {
          // Use placeholder if no renders exist
          product.imageUrl = "https://placehold.co/50x50?text=CharpstAR";
        }
        return product;
      }));
  
      setProducts(productsWithImages);
      setIsLoading(false);
    }
    if(session) {
      fetchProducts();
    }
  }, [session]);

  const handleNavigate = (product) => {
    // Store productName in localStorage or sessionStorage
    sessionStorage.setItem('productName', product.name);
  
    // Navigate without productName in the query
    router.push(`/model/${session?.user?.name}/${product.articleID}`);
  };
  function GADataComponent() {
    const [gaData, setGaData] = useState([]);
  
    useEffect(() => {
      async function loadData() {
        const response = await fetch('/api/gaData');
        const data = await response.json();
        if (Array.isArray(data)) {
          setGaData(data);
        } else {
          console.error('Data fetched is not an array:', data);
          setGaData([]); // Set to empty array if data is not as expected
        }
      }
      loadData();
    }, []);
  
    return (
      <div>
        <h2>GA Event Counts</h2>
        <ul className="dataList">
          {gaData.map((row, index) => (
            <li key={index} className={"dataItem"}>{row.event_name}: {row.event_count}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="container-fluid navContainer">
        <div className="py-3 nav">
            <img src="https://js.charpstar.net/Website/images/logo.svg" width="150px"/>
        </div>
    </div> 
      <div className = "mainContainer table-responsive">
      
      <p>Welcome, {session?.user?.name || 'Guest'}! 
        {!session && (
          <Link href="/login">
             - Login
          </Link>
        )}
      </p>
      <table className="table dashboard-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Product</th>
            <th>Product Link</th>
            <th className='text-center'>Viewer Page</th>
          </tr>
        </thead>

        <tbody>
        {isLoading ? (
          // Render 5 skeleton rows as an example
          Array.from({ length: 10 }, (_, index) => <SkeletonRow key={index} />)
        ) : (
          products.map((product, index) => (
            <tr key={index}>
              <td>
                <img src={product.imageUrl} alt="Product Thumbnail" className="product-thumbnail" />
              </td>
              <td>
                <span className="product-name">{product.name}</span><br />
                <span className="article-id">{product.articleID}</span>
              </td>
              <td><a href={product.productLink} target="_blank" rel="noopener noreferrer">{product.productLink}</a></td>
              <td className='text-center'><button className = "table-button" onClick={() => handleNavigate(product)}>View Model</button></td>
            </tr>
           ))
           )}
        </tbody>

      </table>
      </div>

      <GADataComponent />
    </div>
  );
}