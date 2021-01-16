import { useCallback, useEffect, useState } from 'react'

function useInput(defaultValue) {
  const [value, setValue] = useState(defaultValue)
  
  const onInput = useCallback((ev) => {
    setValue(ev.target.value)
  }, [])

  return [value, onInput]
}

function debounce(callback, wait, immediate = false) {
  let timeout = null 
  
  return function() {
    const callNow = immediate && !timeout
    const next = () => callback.apply(this, arguments)
    
    clearTimeout(timeout)
    timeout = setTimeout(next, wait)

    if (callNow) {
      next() 
    }
  }
}

function useFetchRepos(defaultUsername) {
  const [username, setUsername] = useState(defaultUsername)
  const [repos, setRepos] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchRepos = useCallback(debounce(async (username) => {
    const res = await fetch(`https://api.github.com/users/${username}/repos`)
      .catch(err => setRepos([]))
      .finally(() => setIsLoading(false))
    
    if (!res.ok) return setRepos([])

    return setRepos(await res.json())
  }, 2000), [])

  useEffect(() => {
    if (!username) {
      setIsLoading(false)
      setRepos([])
      return;
    }
    setIsLoading(true)
    fetchRepos(username)
  }, [username])

  return [repos, setUsername, isLoading]
}

export default function Home() {
  const [username, onUsernameChange] = useInput('')
  const [repos, fetchRepos, isLoading] = useFetchRepos(username)

  useEffect(() => {
    fetchRepos(username)
  }, [username])
  
  return (
    <div style={{padding: 20}}>
      <div>
        <input onChange={onUsernameChange} value={username}></input>
      </div>
      {isLoading && 'Loading...'}
      {!isLoading && !repos.length && username && `Repositories under username '${username}' is not found.`}
      <ul>
        {!isLoading && repos.map((repo, i) => (
          <li key={i}><a href={`${repo.html_url}`}>{repo.full_name}</a></li>
        ))}
      </ul>
    </div>
  )
}
