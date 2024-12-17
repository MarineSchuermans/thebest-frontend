it ('Get favorites', () => {
    const reduccer = {
        nickname: 'tes',
        token: '4nr5k20YHjYiWqqq_62WaTy827s_Byvh',
        favorites: ['6759c36b41a7d64d06dac3dd', '6759c36941a7d64d06dac3c6']
    }

    const result = getFavorites(reduccer)

    expect(result).toEqual( ['6759c36b41a7d64d06dac3dd', '6759c36941a7d64d06dac3c6'])
} )

function getFavorites(userInfo){
    const favoritesResult = []

    for (let i=0; i<userInfo.favorites.length; i++){
        favoritesResult.push(userInfo.favorites[i])
    }    

    return favoritesResult
}
