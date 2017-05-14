<?
if ($_SERVER['REQUEST_METHOD'] === 'POST')
{
  $file = '/tmp/sample-app.log';
  $message = file_get_contents('php://input');
  file_put_contents($file, date('Y-m-d H:i:s') . " Received message: " . $message . "\n", FILE_APPEND);
}
else
{
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <link rel="stylesheet" type="text/css" href="/navirants/css/style.css">
	<link rel="stylesheet" type="text/css" href="/css/bootstrap.css">

	<script type="text/javascript" src="/js/jquery-3.2.1.js"></script>
	<script type="text/javascript" src="/js/jquery-3.2.1.min.js"></script>
	<script type="text/javascript" src="/js/bootstrap.js"></script>

	<script type="text/javascript" src="http://maps.google.com/maps/api/js?key=AIzaSyCyKO-tcLuSrB_Em-VZR_IJDzkcgJe3Hdg&libraries=drawing"></script>
	<script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
	<script type="text/javascript" src="/js/script.js"></script>
	<script type="text/javascript" src="/js/filter.js"></script>

	<!-- Map Icons -->
	<link rel="stylesheet" type="text/css" href="/css/map-icons.css">
	<link rel="stylesheet" type="text/css" href="/css/rangeSlider.css">
	<script type="text/javascript" src="/js/map-icons.js"></script>
	<script src="/js/rangeSlider.js"></script>
	
	<script type="text/javascript">
		google.maps.event.addDomListener(window, 'load', initMap);
	</script>
</head>
<body>
		<div class="container-fluid">

			<div id="left-container">
				<div class="filter-header ">
					<h5>FILTER RESTAURANTS</h5>
				</div>
				<div class="filter-content">
					<button type="button" class="btn btn-link disabled" id="btnSelectAll">Select All</button>
					<button type="button" class="btn btn-link" id="btnDeselectAll">Deselect All</button>
					<div class="checkbox">
						<label><input type="checkbox" class="checkbox-resto-type" value="0" checked> Fastfood</label>
					</div>
					<div class="checkbox">
						<label><input type="checkbox" class="checkbox-resto-type" value="1" checked> Casual dining</label>
					</div>
						<div class="checkbox">
						<label><input type="checkbox" class="checkbox-resto-type" value="2" checked> Fine dining</label>
					</div>
					<div class="checkbox">
						<label><input type="checkbox" class="checkbox-resto-type" value="3" checked> Buffet</label>
						</div>
					<div class="checkbox">
						<label><input type="checkbox" class="checkbox-resto-type" value="4" checked> Coffee shop</label>
					</div>
				</div>
				<div class="filter-content">
					<div class="checkbox">
						<label><input type="checkbox" class="checkbox-resto-nearby" value="resto"> <span> Show restaurants in <strong>200 M</strong> radius </span></label>
					</div>
					<div id="resto-rangeSlider">
						<input type="range" class = "range-nearby" min="1" max="30" step="0.1" value="2" data-rangeSlider>
					</div>
					<div>
						<label class="no-of-resto" style="display: none; "> No. of nearby restaurants : <strong> 5 </strong> </label>
					</div>
  				</div>
  				<div class="resto_info" style="display: none;">
					<div class="filter-header">
						<h5>RESTAURANT INFORMATIONS</h5>
					</div>
					<div id="mode-of-trans-panel" style="display: none;">
						<nav class="navbar navbar-inverse">
						<ul class="nav navbar-nav">
							<li class="DRIVING active"><a href="#" class="map-icon-label map-icon map-icon-taxi-stand"></a></li>
							<li class="WALKING"><a href="#" class="map-icon-label map-icon map-icon-walking"></a></li>
							<li class="BICYCLING"><a href="#" class="map-icon-label map-icon map-icon-bicycle-store"></a></li>
							<li class="TRANSIT"><a href="#" class="map-icon-label map-icon map-icon-transit-station"></a></li>
						</ul>
						</nav>
					</div>
					<div class="filter-content">
							<table class="table table-condensed">
						    <tbody>
						      <tr>
						        <th>NAME</th>
						        <td><span class="resto-name">CNT Lechon de Guadalupe</span></td>
						      </tr>
						      <tr>
						        <th>SPECIALTY</th>
						        <td><span class="resto-specialty">Lechon</span></td>
						      </tr>
						      <tr>
						        <th>VISITED TODAY</th>
						        <td><span class="resto-visited">0</span></td>
						      </tr>
						    </tbody>
						  </table>
						 <div class="text-center">
	  						<button id="resto-analytics" type="button" class="btn btn-primary">Show Analytics</button>
						 </div>
	  				</div>

  				</div>
			</div>

			<div id="mapholder"></div>
			<div id="error-message"></div>
		<div id="filter-panel" class="col-md-4 text-center">
			<div class="filter-header">					
				<label class="close" data-dismiss="alert" aria-label="close" style="margin-right: 5px;">&times;</label>
				<h5>RESTAURANT ANALYTICS</h5>
			</div>
			<div id="chart_div"></div>
		</div>
	</div>
    <!--[if lt IE 9]><script src="http://css3-mediaqueries-js.googlecode.com/svn/trunk/css3-mediaqueries.js"></script><![endif]-->
</body>
</html>
<? 
} 
?>
