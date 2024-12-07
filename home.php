<!DOCTYPE html>
<html lang= "en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CM Website</title>
<link rel="stylesheet" href="styles.css"/>
</head>
<body>
<nav class="navbar">
<div class="navbar__container">
<a href="/" id="navbar__logo">Cultural Mosaic</a>
<div class="navbar__toggle" id="mobile-menu">
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
</div>
<ul class="navbar__menu">
<li class="navbar__item">
  <a href="/" class="navbar__links">About</a>
</li>
<li class="navbar__item">
  <a href="/" class="navbar__links">Languages</a>
</li>
<li class="navbar__item">
  <a href="/" class="navbar__links">Resources</a>
</li>
<li class="navbar__item">
  <a href="/" class="navbar__links">Team</a>
</li>
<li class="navbar__btn">
    <a href="page1.php" class="button">Sign Up</a>
</li>
</ul>																		                                                                                                                                                                                                     
    
<style>																                                                                                                                                                                                             
*{
    box-sizing:border-box;
margin: 0;
padding: 0;
font-family:Garamond, serif;}
.navbar {
background:#f7d577;
	height: 80px;
display:flex;
justify-content:center;
align-items:center;
	font-size: 1.2rem;
position:
	sticky;
	top: 0;
	z-index: 999;
}
.navbar__container {
    display:flex;
    justify-content:space-between;
	height: 80px;
	z-index: 1;
	width: 100%;
	max-width: 1300px;
	margin: 0 auto;
	padding: 0 50px;
}

.navbar__logo {
background-color:
#F4A261;
background-image:
linear-gradient(to top: #f5c94e 0%, #f5e8c4 100%);
background-size: 100%;
-webkit-background-clip: text;
-moz-background-clip: text;
display: flex;
align-items:center;
cursor:pointer;
text-decoration:none;
font-size: 2rem;
}

.navbar__menu {
display:flex;
align-items:center;
list-style:none;
text-align:center;
}

.navbar__item {
	height: 100px;
}

.navbar__links {
color: #2f2e41;
display:flex;
align-items:center;
justify-content:center;
text-decoration:none;
	padding: 0 1rem;
	height: 100%;
}

.navbar__btn {
display:flex;
justify-content:center;
align-items:center;
	padding: 0 1rem;
	width: 100%;
}

.button {
display:flex;
justify-content:center;
align-items:center;
text-decoration:none;
	padding: 10px 20px;
	height: 100%;
	width: 100%;
border:none;
outline:none;
	border-radius: 4px;
background:#2f2e41;
color:#fff;
}

.button:hover {
background:
#F7D577;
transition:
	all 0.3s ease;
}

.navbar__links:hover {
color: #fff;
transition:
	all 0.3s ease;
}
/*First Page CSS */
.main {
background-color:#fff;
}

.main__container {
display:grid;
	grid-template-columns: 1fr 1fr;
align-items:center;
justify-self:center;
	margin: 0 auto;
	height: 90vh;
background-color:#fff;
	z-index: 1;
	width: 100%;
	max-width: 1300px;
	padding: 0 50px;
}

.main__content h1 {
	font-size: 4rem;
background-color:
#F7D577 ;
	background-size: 100%;
color:
#2f2e41;
font-family:
	Garamond, serif;

}

.main__content h2 {
	font-size: 3rem;
background-color:
#F7D577;
	background-size: 50%;
color:
#2f2e41;
font-family:
	Garamond, serif;


}
.main__content p {
	font-size: 2.5rem;
background-color:
#F7D577;
	background-size: 50%;
color:
	black;
font-family:
	Garamond, serif;

}

/*2nd Page CSS*/

.slide {
	margin: 100px 0 0 200px;
	width: 70%;
	height: 450px;
display:
	flex;
justify-content:
	center;
	gap: 20px;
}

.slide img {
	width: 50%;
	height: 250%;
object-fit:
	cover;
	border-radius: 10px;
	border: 2px solid black;
transition:
	all ease-in-out 0.5s;
}

.container img:
hover {
	width: 25%;
}
/*2nd page*/
.image-container {
    margin: 200px 0 0 200px;
    width: 70%;
    height: 450px;
    display: flex;
    justify-content: center;
    gap: 15px;
}
.image-container img {
    width: 100%;
    height: 200%;
    object-fit: cover;
    border-radius: 10px;
    border: 2px solid white;
}
.container img:hover {
    width: 50%;
}
	</style>
	</div>
	</nav>
	<!--First Page-->
	<div class="main">
		<div class="main__container">
			<div class="main__content">
				<h1>Our Effective</h1>
				<h2>Way to Learn Languages</h2>
				<p>See What Makes Us Different...</p>
					</div>
					<div class="main__img--container">
						<img src="https://i.pinimg.com/736x/1f/60/d9/1f60d9f1f558e5549354ec37316388a9.jpg"/>
						</div>
						</div>
						</div>
						<!--2nd Page-->
						<div class="image-container">
							<img src="https://i.pinimg.com/736x/f1/e7/20/f1e72089894154dc5fc02e9b5ed5eca8.jpg">
							<img src="https://i.pinimg.com/736x/7b/25/03/7b2503d0d2e0e81aab71905ff86cc2bf.jpg">
							</div>
							</body>
							</html>