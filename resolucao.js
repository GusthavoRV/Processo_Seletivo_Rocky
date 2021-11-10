//---------- Functions ----------//

//Função para ler o arquivo broken-database.json (adaptado do site: https://www.ti-enxame.com/pt/javascript/como-ler-um-arquivo-json-local-externo-em-javascript/1043362222/)
function readFile() {
  var fs = require('fs')
  // Leitura do arquivo JSON
  var readFile = fs.readFileSync('./broken-database.json', 'utf8')
  // Transforma os dados do arquivo em array
  var data = JSON.parse(readFile)

  return data
}

//Função para substituir os caracteres "æ" por "a", "¢" por "c", "ø" por "o", "ß" por "b".
function replaceCharacter(names) {
  let replace = ''

  replace = names
    .split('ø')
    .join('o')
    .split('æ')
    .join('a')
    .split('¢')
    .join('c')
    .split('ß')
    .join('b')

  return replace
}

//Função para corrigir preços do tipo String para Number
function fixPrice(prices) {
  if (typeof prices === 'string') {
    return Number(prices)
  }

  return prices
}

//Função para adicionar o quantity
function addQuantity(object) {
  object.quantity = 0

  return object
}

//---------- Recuperação dos dados originais do banco de dados ----------//

let dataBase = readFile()

for (let position in dataBase) {
  //Substituir os caracteres
  dataBase[position].name = replaceCharacter(dataBase[position].name)

  //Corrigir preço
  dataBase[position].price = fixPrice(dataBase[position].price)

  //Adicionar quantity
  if (dataBase[position].quantity === undefined) {
    dataBase[position] = addQuantity(dataBase[position])
  }
}

//---------- Criando um novo JSON com o banco de dados recuperado ----------//

//Adaptado do site: https://www.ti-enxame.com/pt/javascript/gravaradicionar-dados-no-arquivo-json-usando-node.js/824647876/
function saveNewDataBase(recoveredDataBase) {
  var fs = require('fs')

  // Leitura do arquivo JSON
  var data = JSON.stringify(recoveredDataBase, null, 4)

  fs.writeFileSync('./saida.json', data)
}

saveNewDataBase(dataBase)

//---------- Validação do banco de dados corrigido ----------//

//Ordenando os produtos por categoria em ordem alfabética e por id em ordem crescente
dataBase.sort(function (a, b) {
  if (a.category > b.category) {
    return 1
  }
  if (a.category < b.category) {
    return -1
  }
  if (a.id > b.id) {
    return 1
  }
  if (a.id < b.id) {
    return -1
  }
  return 0
})

//Imprimindo os produtos por categoria em ordem alfabética e por id em ordem crescente
console.log('\n' + 'Produtos:')

for (let position in dataBase) {
  console.log('>' + JSON.stringify(dataBase[position].name))
}

//Calculando o valor em estoque por categoria

function searchPosition(vector, name) {
  var address = -1
  //localizar a posição do elemento passado como parametro
  address = vector
    .map(function (e) {
      return e.category
    })
    .indexOf(name)

  return address
}

let categories = []

//Somando o valor de estoque de cada categoria
for (let position in dataBase) {
  address = searchPosition(categories, dataBase[position].category)
  if (address >= 0) {
    categories[address].price +=
      dataBase[position].price * dataBase[position].quantity
  } else {
    categories.push({
      category: dataBase[position].category,
      price: dataBase[position].price * dataBase[position].quantity
    })
  }
}

console.log('\n' + 'Total por categoria')

for (let position in categories) {
  console.log(
    '>' +
      JSON.stringify(
        categories[position].category +
          ' ' +
          categories[position].price.toLocaleString('pt-br', {
            style: 'currency',
            currency: 'BRL'
          })
      )
  )
}
