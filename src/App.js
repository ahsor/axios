import Header from './Header';
import Footer from './Footer';
import { useEffect, useState } from 'react';
import React from 'react';
import { FaPlus, FaTrashAlt } from 'react-icons/fa';
import { useRef } from 'react';
import dummy from './db/items.json'
import axios from 'axios';

const api =  axios.create({
    baseURL: 'http://localhost:3500',
    headers: {
      'Content-Type': 'application/json'
    },
});

function App() {
  // json-server를 이용하여 데이터를 읽어 온 후 
  // npx json-server -p 3500 -w db/items.json
  // npx json-server -p 3500 -w ./src/db/items.json

  const API_URL = 'http://localhost:3500/items';
  const [items, setItems] = useState(dummy.items || []); 
  // const [items, setItems] = useState([]); 
  const [newItem, setNewItem] = useState('')
  const [search, setSearch] = useState('')
 
  const [fetchError, setFetchError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // false인 상태 처리 확인

  useEffect(() => {
    const fetchItems = async () => {
      try {
          const response = await api.get(API_URL);
          if (!response.ok) throw Error('데이터를 찾을 수 없습니다.');
          // const listItems = await response.json();
          // setItems(listItems);
          setItems(response.data);
          setFetchError(null);
      } catch (err) {
          setFetchError(err.message);
      } finally {
          setIsLoading(false);
      }
    }

   // fetchItems()
    // 느린 컴퓨터에서는 순간적으로 목록을 읽어오지 못하는 문제 발생 
    setTimeout(() => fetchItems(), 2000);
    // isLoadding 처리
  
  }, [])

  const apiRequest = async  (url = '', optionsObj = null, errMsg = null) => {
    // promise처리
      try {
          const response = await  fetch(url, optionsObj);
          if (!response.ok) throw Error('다시 로드하세요.');
      } catch (err) {
          errMsg = err.message;
      } finally {
          return errMsg;
      }
  }

  const addItem = async  (item) => {
     try{
          
          const id = items.length ? items[items.length - 1].id + 1 : 1;
          const myNewItem = { id, checked: false, item };
          const listItems = [...items, myNewItem];
          console.log( myNewItem)
          setItems(listItems);

          const response = await api.put(`/${'http://localhost:3500/items'}`, { id, checked: false, item });
     }catch(err){
        console.log('my addItem Error')
    }
     
  }

  const handleCheck = async  (id) => {
    const listItems = items.map((item) => item.id === id ? { ...item, checked: !item.checked } : item);
    setItems(listItems);

    const myItem = listItems.filter((item) => item.id === id);
    const updateOptions = {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ checked: myItem[0].checked })
    };
    const reqUrl = `${API_URL}/${id}`;
    const result =  await apiRequest(reqUrl, updateOptions);
    if (result) setFetchError(result);
  }

  const handleDelete = async  (id) => {
    try{
        const listItems = items.filter((item) => item.id !== id);
        setItems(listItems);

        await api.delete(`${API_URL}/${id}`)
    }catch(err){
      console.log('my delete Error')
    }
    
    
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newItem) return;
    addItem(newItem);
    setNewItem('');
  }

  return (
    <div className="App">
      <Header title="장바구니 목록" />
      <AddItem
        newItem={newItem}
        setNewItem={setNewItem}
        handleSubmit={handleSubmit}
      />
      <SearchItem
        search={search}
        setSearch={setSearch}
      />
      <Content
        isLoading={isLoading}
        fetchError={ fetchError}
        items={items.filter(item => ((item.item).toLowerCase()).includes(search.toLowerCase()))}
        handleCheck={handleCheck}
        handleDelete={handleDelete}
      />
      <Footer length={items.length} />
    </div>
  );
}

const Content = ({isLoading, fetchError, items, handleCheck, handleDelete }) => {
  return (
      <main>
         {items.length ? (
              <ItemList
                  items={items}
                  handleCheck={handleCheck}
                  handleDelete={handleDelete}
              />
          ) : (
              <p style={{ marginTop: '2rem' }}> 장바구니 목록이 비었습니다.</p>
          )}
      </main>
      // <main>
      //   {isLoading && <p>Loading Items...</p>}
      //   {fetchError && <p style={{ color: "red" }}>{`Error: ${fetchError}`}</p>}
      //   {!fetchError && !isLoading && items.length ? (
      //         <ItemList
      //             items={items}
      //             handleCheck={handleCheck}
      //             handleDelete={handleDelete}
      //         />
      //     ) : (
      //         <p style={{ marginTop: '2rem' }}> 장바구니 목록이 비었습니다.</p>
      //     )}
      // </main>
  )
}

const AddItem = ({ newItem, setNewItem, handleSubmit }) => {
  const inputRef = useRef();

  return (
      <form className='addForm' onSubmit={handleSubmit}>
          <label htmlFor='addItem'>Add Item</label>
          <input
              autoFocus
              ref={inputRef}
              id='addItem'
              type='text'
              placeholder='Add Item'
              required
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
          />
          <button
              type='submit'
              aria-label='Add Item'
              onClick={() => inputRef.current.focus()}
          >
              <FaPlus />
          </button>
      </form>
  )
}

const ItemList = ({ items, handleCheck, handleDelete }) => {
  return (
      <ul>
          {items.map((item) => (
              <LineItem
                  key={item.id}
                  item={item}
                  handleCheck={handleCheck}
                  handleDelete={handleDelete}
              />
          ))}
      </ul>
  )
}

const LineItem = ({ item, handleCheck, handleDelete }) => {
  return (
      <li className="item">
          <input
              type="checkbox"
              onChange={() => handleCheck(item.id)}
              checked={item.checked}
          />
          <label
              style={(item.checked) ? { textDecoration: 'line-through' } : null}
              onDoubleClick={() => handleCheck(item.id)}
          >{item.item}</label>
          <FaTrashAlt
              onClick={() => handleDelete(item.id)}
              role="button"
              tabIndex="0"
              aria-label={`Delete ${item.item}`}
          />
      </li>
  )
}

const SearchItem = ({ search, setSearch }) => {
  return (
      <form className='searchForm' onSubmit={(e) => e.preventDefault()}>
          <label htmlFor='search'>Search</label>
          <input
              id='search'
              type='text'
              role='searchbox'
              placeholder='Search Items'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
          />
      </form>
  )
}

export default App;