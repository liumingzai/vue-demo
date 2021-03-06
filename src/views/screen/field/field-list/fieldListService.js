import Http from "@/http";

class FieldListService {
  constructor() {
    this.http = new Http();
  }

  //获取数据列表
  getDataList(params){
    const method = 'innoField/getFields'
    return this.http.GET(method,params)  

  }

  //删除数据
  deleteFieldData(id){
    const method = 'innoField/deleteField'
    return this.http.DELETE(method,{fieldId:id}) 
  }
}


export default FieldListService;