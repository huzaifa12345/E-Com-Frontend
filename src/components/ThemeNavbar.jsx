import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ThemeNavbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { getCartItemsCount, setCartOpen } = useCart();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const openNav = () => {
    document.getElementById("mySidenav").style.width = "250px";
  };

  const closeNav = () => {
    document.getElementById("mySidenav").style.width = "0";
  };

  return (
    <div className="banner_bg_main">
      {/* header top section start */}
      <div className="container">
        <div className="header_section_top">
          <div className="row">
            <div className="col-sm-12">
              <div className="custom_menu">
                <ul>
                  <li><a href="#">Best Sellers</a></li>
                  <li><a href="#">Gift Ideas</a></li>
                  <li><a href="#">New Releases</a></li>
                  <li><a href="#">Today's Deals</a></li>
                  <li><a href="#">Customer Service</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* header top section start */}
      {/* logo section start */}
      <div className="logo_section">
        <div className="container">
          <div className="row">
            <div className="col-sm-12">
              <div className="logo">
                <Link to="/">
                  <img src="/src/assets/images/kidcolor(1).png" alt="Kids Colours Logo" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* logo section end */}
      {/* header section start */}
      <div className="header_section">
        <div className="container">
          <div className="containt_main">
            <div id="mySidenav" className="sidenav">
              <a href="javascript:void(0)" className="closebtn" onClick={closeNav}>&times;</a>
              <Link to="/">Home</Link>
              <Link to="/fashion">Fashion</Link>
              <Link to="/electronic">Electronic</Link>
              <Link to="/jewellery">Jewellery</Link>
            </div>
            <span className="toggle_icon" onClick={openNav}>
              <img src="/src/assets/images/toggle-icon.png" alt="Toggle" />
            </span>
            <div className="dropdown">
              <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                All Category 
              </button>
              <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                <Link className="dropdown-item" to="/fashion">Fashion</Link>
                <Link className="dropdown-item" to="/electronic">Electronic</Link>
                <Link className="dropdown-item" to="/jewellery">Jewellery</Link>
              </div>
            </div>
            <div className="main">
              {/* Another variation with a button */}
              <form onSubmit={handleSearch}>
                <div className="input-group">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Search this blog"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="input-group-append">
                    <button className="btn btn-secondary" type="submit" style={{ backgroundColor: '#f26522', borderColor: '#f26522' }}>
                      <i className="fa fa-search"></i>
                    </button>
                  </div>
                </div>
              </form>
            </div>
            <div className="header_box">
              <div className="lang_box">
                <a href="#" title="Language" className="nav-link" data-toggle="dropdown" aria-expanded="true">
                  <img src="/src/assets/images/flag-uk.png" alt="flag" className="mr-2" title="United Kingdom" /> 
                  English <i className="fa fa-angle-down ml-2" aria-hidden="true"></i>
                </a>
                <div className="dropdown-menu">
                  <a href="#" className="dropdown-item">
                    <img src="/src/assets/images/flag-france.png" className="mr-2" alt="flag" />
                    French
                  </a>
                </div>
              </div>
              <div className="login_menu">
                <ul>
                  <li>
                    <a href="#" onClick={() => setCartOpen(true)}>
                      <i className="fa fa-shopping-cart" aria-hidden="true"></i>
                      <span className="padding_10">Cart ({getCartItemsCount()})</span>
                    </a>
                  </li>
                  <li>
                    <Link to="/account">
                      <i className="fa fa-user" aria-hidden="true"></i>
                      <span className="padding_10">User</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* header section end */}
    </div>
  );
};

export default ThemeNavbar;
