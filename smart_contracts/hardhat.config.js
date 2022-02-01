//Kovan network(network address) -> https://eth-kovan.alchemyapi.io/v2/c32eAfs0_riG5H1hLXyBhXoEr2fQViU8
//Account founded the deploy -> 6fe98aafdce83dcfb06d364137a320fc0c23dcf5aac68f7ac0e76ec331b4fcbd
//Deployed(contract address) -> 0xeF7284877bDC8A35D95d2DE3DC554EC13Df70333
//DeployedV2 -> 0x95c279b8DDfe90B78C7c325B8651008B3920F7ad

require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity:'0.8.0',
  networks:{
    kovan:{
      url: 'https://eth-kovan.alchemyapi.io/v2/kLygicR0wQfOvzxhLw8f7mMy2BLkSXBD',
      accounts:['d53e0106095b96eece78986d4c65f0fff0098bd808a34b2afa13c780dfac6618']
    }
  }
}