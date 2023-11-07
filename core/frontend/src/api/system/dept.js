import request from '@/utils/request'

export function allDeptList(){
  return request({
    url: 'api/dept/list',
    method: 'get'
  })
}
export function allDept() {
  return request({
    url: 'api/dept/all',
    method: 'get'
  })
}
export function addDept(data) {
  return request({
    url: 'api/dept',
    method: 'post',
    data
  })
}

export function batchDelDept(data) {
  return request({
    url: 'api/dept',
    method: 'delete',
    data
  })
}

export function editDept(data) {
  return request({
    url: 'api/dept',
    method: 'put',
    data
  })
}

export function getDeptTree(pid) {
  return request({
    url: 'api/dept/childNodes/' + pid,
    method: 'post',
    loading: true
  })
}

export function loadTable(data) {
  return request({
    url: 'api/dept/search',
    method: 'post',
    data,
    loading: false
  })
}

export function treeByDeptId(deptId) {
  return request({
    url: '/api/dept/nodesByDeptId/' + deptId,
    method: 'post'
  })
}
