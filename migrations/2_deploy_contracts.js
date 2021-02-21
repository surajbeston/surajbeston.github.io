const EnergyToken = artifacts.require('EnergyToken')

module.exports = function(deployer) {
    var addrArr = ["0x9423A7c0632DeF23714f69906B45D3A0f5BB33Ef"]
    deployer.deploy(EnergyToken, 0, addrArr)
}
