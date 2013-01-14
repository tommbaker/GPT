var rootScope;

function TheGame($scope) {

	rootScope = $scope;
	$scope.stocks = [];
	$scope.balance = '';
	$scope.username = '';
}