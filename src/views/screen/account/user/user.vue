<template>
  <div class="user_manage">
    <div class="usmg_title">
      <span>用户列表({{totalPageData}})</span>

      <el-button type='primary' @click="openAddDialog">创建用户</el-button>

    </div>

    <div class="search_form">
      <el-form :model='searchParams' ref='searchParams' :inline='true'>
      

        <el-form-item label='用户状态'>
          <el-select v-model="searchParams.state" clearable placeholder="全部">
            <el-option v-for="item in activeList" :key="item.value" :value="item.value" :label="item.name">

            </el-option>
          </el-select>

        </el-form-item>

        <el-form-item label='搜索'>

          <el-input v-model="searchParams.phone" placeholder="手机号"></el-input>
        </el-form-item>

        <el-button type='primary' @click="handleSearch">
          查询
        </el-button>

      </el-form>

    </div>

    <div>

      <div class="table_header">
        
        <span>用户列表</span>
        <div class="tb_head_right">
            <el-checkbox v-model="isAllchecked" @change="handleSelectAll">全选</el-checkbox>
            <span style="padding-left:20px">批量操作</span>
            <el-select v-model="operationTpye" clearable>
              <el-option value='批量删除'></el-option>
              <el-option value='批量停用'></el-option>
              <el-option value='批量启用'></el-option>
            </el-select>
            <el-button size='small' type='primary' @click="operateDatas">确定</el-button>
        </div>
       
      </div>  

      <el-table
      ref="multipleTable" 
      :data="userList" 
      style="width: 100%" 
      v-loading='loading' 
      @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="30">
        </el-table-column>
        <el-table-column prop="username" label="用户名" width="">
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="">
        </el-table-column>
        <el-table-column prop="userType" label="用户类型" width="">
        </el-table-column>
        <el-table-column label="负责项目" width="">
          <template slot-scope="scope">
            <span v-for="item in scope.row.projects" :key="item">&nbsp;{{item}}</span>

          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="创建时间" width="">
        </el-table-column>

        <el-table-column label="用户状态" width="">
          <template slot-scope="scope">
            <el-switch 
            v-model="scope.row.state" 
            :active-value='1' 
            :inactive-value='0'
            @change="handleUserState(scope.row)">

            </el-switch>
            <span v-show="scope.row.state=='1'">启用</span>
            <span v-show="scope.row.state=='0'">停用</span>
          </template>

        </el-table-column>

        <el-table-column label="操作" width="">
          <template slot-scope="scope">

            <el-button type="text" size="small" @click="openEditDialog(scope.row)">编辑</el-button>
            <el-button type='text' size='small' @click="handleDeleteUser(scope.row)">删除</el-button>
          </template>
        </el-table-column>

      </el-table>

      <el-pagination 
      background 
      layout="prev, pager, next" 
      :total='totalPageData' 
      @current-change='handlePage' 
      :current-page.sync='searchParams.pageNum'>

      </el-pagination>

    </div>

    <el-dialog title="用户信息" :visible.sync="userFormVisible" :before-close="handleUserFormClose" width="60%">
       <el-form ref="userParams" :model='userParams' label-width='80px'>
        <div style="width:300px">
          <el-form-item label="用户名">
            <el-input v-model="userParams.username" placeholder="用户名"></el-input>
          </el-form-item>

          <el-form-item label="手机号">
            <el-input v-model="userParams.phone" placeholder="手机号"></el-input>
          </el-form-item>

          <el-form-item label="密码" v-show="isEdit==false">
            <el-input v-model="userParams.password" type='password'></el-input>
          </el-form-item>
        </div>

        <el-form-item label='用户状态'>
          <el-switch v-model="userParams.state" active-value='1' inactive-value='0'>

          </el-switch>
          <span v-show="userParams.state=='1'">启用</span>
          <span v-show="userParams.state=='0'">停用</span>
        </el-form-item>

        <el-form-item label='用户角色' v-if="userType==1">
           <el-radio-group v-model="userParams.roles">
              <el-radio  label="2">项目管理员</el-radio>
              <el-radio  label="3">项目人员</el-radio>

           </el-radio-group>
              

        </el-form-item>
        <div style="width:300px" v-else>
          <el-form-item label='用户角色'>
             
               <el-input disabled placeholder="项目人员"></el-input>
              
          </el-form-item>
        </div>
        <el-form-item label='负责项目' v-if="userType==1">
          
          <el-radio-group v-model="userParams.projects">

            <el-radio v-for="project in projectList" :label='project.name' :key="project.name">

            </el-radio>
          </el-radio-group>
        </el-form-item>
        <div style="width:300px" v-else>
          <el-form-item label='负责项目'>
              
              <el-input disabled :placeholder="projectName"></el-input>
              
          </el-form-item>
        </div> 
      </el-form> 

      <span slot="footer" class="dialog-footer">

        <el-button @click="handleUserFormClose">取 消</el-button>
        <el-button type="primary" @click="handleAddUser" v-show="isEdit==false">确定</el-button>
        <el-button type='primary' @click="handleEditUser" v-show="isEdit==true">保存</el-button>
      </span>
    </el-dialog>

  </div>

</template>

<script>
import moment from "moment";
import UserService from "./userService";
var _UserService = new UserService();
export default {
  name: "user",
  data() {
    return {
      totalPageData: null,
      userList: [],
      loading: true,
      searchParams: {
        pageNum: 1,
        phone: "",
        state: "",
        type: ""
        
        
      },
      typeList: [{ name: "管理员", value: 1 }, { name: "研究员", value: 2 }],
      activeList: [{ name: "启用", value: 1 }, { name: "停用", value: 0 }],
      userFormVisible: false,
      userParams: {
        username: "",
        phone: "",
        password: "",
        projects: null,
        roles:'3',
        state: "1",
        
      },
      uid:'',
      userType:null,
      projectName:null,
      projectList: [],
      isEdit: false,
      multipleSelection:[],
      operationTpye:"",
      isAllchecked: false
    };
  },
  methods: {
      //获取用户列表
    getUserList() {
      if (this.userType==1){
          _UserService
        .getAccountList(this.searchParams)
        .then(data => {
          console.log(data);
          if (data.code == 2000) {
            this.totalPageData = data.size;
            this.userList = data.data.map(item => {
              const userType = item.roles[0].name;
              const projects = item.projects.map(item => {
                return item.name;
              });
              return {
                username: item.username,
                phone: item.phone,
                userType: userType,
                projects: projects,
                createTime: moment(item.createTime).format("YYYY-MM-DD"),
                state: item.state,
                id: item.id,
                password: item.password
              };
            });
            this.loading = false;
          }else{
            this.$message.error(data.message)
          }
        })
        .catch(err => {
          console.log(data);
        });
      }else{
         const searchParams = {projectName:this.projectName,uid:this.uid,...this.searchParams};
         _UserService
        .getProjectAccountList(searchParams)
        .then(data => {
          console.log(data);
          if (data.code == 2000) {
            this.totalPageData = data.size;
            this.userList = data.data.map(item => {
              const userType = item.roles[0].name;
              const projects = item.projects.map(item => {
                return item.name;
              });
              return {
                username: item.username,
                phone: item.phone,
                userType: userType,
                projects: projects,
                createTime: moment(item.createTime).format("YYYY-MM-DD"),
                state: item.state,
                id: item.id,
                password: item.password
              };
            });
            this.loading = false;
          }else{
            this.$message.error(data.message)
          }
        })
        .catch(err => {
          console.log(data);
        });

      }

    
    },
       //搜索相关用户
    handleSearch(){
        this.searchParams.pageNum=1;
        this.getUserList()
    },
      //获取项目列表
    getAllProject() {
      _UserService
        .getProjectList()
        .then(data => {
          console.log(data);
          if (data.code == 2000) {
            this.projectList = data.data.map(item => {
              return {
                id: item.id,
                name: item.name
              };
            });
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    //分页处理
    handlePage(num) {
        this.searchParams.pageNum=num;
        this.getUserList()
    },
      //关闭弹窗
    handleUserFormClose() {
       this.userFormVisible = false;
    },
      //增加用户
    handleAddUser() {
      const password = btoa(this.userParams.password);
     
      const projects = this.projectList.filter(item => item.name===this.userParams.projects);
       
      const roles = this.userParams.roles==2 ? [{id:2,name:'项目管理员'}] : [{id:3,name:'项目人员'}] ;
      
      //console.log(this.userParams);
      const userParams = {
        ...this.userParams,
        password: password,
        projects: projects,
        roles:roles
      };
      
      _UserService
        .addAccount(userParams)
        .then(data => {
          console.log(data);
          if (data.code == 2000) {
            this.$message.success("添加用户成功");
            this.userFormVisible = false;
            this.getUserList()
          } else {
            this.$message.error(data.message);
          }
        })
        .catch(err => {
          console.log(err);
          this.$message.error("网络错误");
        });
    },
       //打开增加弹窗
    openAddDialog() {
      this.isEdit = false;
      this.userFormVisible = true;
      this.userParams = {
        username: "",
        phone: "",
        password: "",
        projects: this.userParams.projects,
        state: "1",
        roles:"3",
        
      };
    },
      //打开编辑弹窗
    openEditDialog(row) {
      this.userFormVisible = true;
      this.isEdit = true;
      this.userParams.username = row.username;
      this.userParams.phone = row.phone;
      this.userParams.projects = row.projects;
      this.userParams.state = row.state == 1 ? "1" : "0";
      this.userParams.id = row.id;
    },
      //编辑用户
    handleEditUser() {
      const projects = this.userParams.projects.map(item => {
        let newProject = {};
        for (let i = 0; i < this.projectList.length; i++) {
          if (item === this.projectList[i].name) {
            newProject = { id: this.projectList[i].id, name: item };
          }
        }
        return newProject;
      });
      const userParams = {
        username: this.userParams.username,
        phone: this.userParams.phone,
        state: this.userParams.state, 
        projects: projects,
        id:this.userParams.id
      };
      _UserService
        .updateAccount(userParams)
        .then(data => {
          console.log(data);
          if (data.code == 2000) {
            this.$message.success("编辑用户成功");
            this.userFormVisible = false;
            this.getUserList()
          } else {
            this.$message.error(data.message);
          }
        })
        .catch(err => {
          console.log(err);
          this.$message.error("网络错误");
        });
    },
      //更改用户状态
    handleUserState(row){
        console.log(row)
        _UserService.updateAccountState(row.id,row.state).then((data) => {
              console.log(data)
              if(data.code==2000){
                this.$message.success('更改用户状态成功')
              }else{
                this.$message.error(data.message)
              }
        }).catch((err) => {
             console.log(err)
             this.$message.error('网络错误')
        });
    },
      //删除用户
    handleDeleteUser(row){
      console.log(row)
          this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
         
           _UserService.deleteAccount(row.id).then((data) => {
              console.log(data)
              if(data.code==2000){
                this.$message.success('删除用户成功')
                  this.totalPageData -= 1;
                  if (this.totalPageData / 10 <= 1) {
                    this.searchParams.pageNum = 1;
                  } else if (this.totalPageData / 10 == this.searchParams.pageNum - 1) {
                    this.searchParams.pageNum--;
                  } else {
                    this.searchParams.pageNum = this.searchParams.pageNum;
                  }
                this.getUserList()
              }else{
                this.$message.error(data.message)
              }
          }).catch((err) => {
            console.log(err)
            this.$message.error('网络错误')
          });

        }).catch((err) => {
          console.log(err)
          this.$message({
            type: 'info',
            message: '已取消删除'
          });          
        }); 

    },
    //批量操作
    operateDatas() {
      console.log(this.operationTpye);
      console.log(this.multipleSelection.length);
      if (this.multipleSelection.length == 0) {
        this.$message.error("请先选择数据");
        return;
      } else {
        if (this.operationTpye == "批量删除") {
          // console.log(1)
          this.$confirm("此操作将永久删除所选用户, 是否继续?", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          })
            .then(() => {
              _UserService
                .deleteAccounts(this.multipleSelection)
                .then(data => {
                  console.log(data);
                  if (data.code == 2000) {
                    this.$message.success("批量删除用户成功");
                    this.totalPageData -= this.multipleSelection.length;
                    if (this.totalPageData / 10 <= 1) {
                      this.searchParams.pageNum = 1;
                    } else if (
                      this.totalPageData / 10 ==
                      this.searchParams.pageNum - 1
                    ) {
                      this.searchParams.pageNum--;
                    } else {
                      this.searchParams.pageNum = this.searchParams.pageNum;
                    }
                    this.getUserList();
                  }
                })
                .catch(err => {
                  console.log(err);
                  this.$message.error("网络错误");
                });
            })
            .catch(() => {
              this.$message({
                type: "info",
                message: "已取消删除"
              });
            });
        } else if (this.operationTpye == "批量启用") {
          console.log(2);
          _UserService
            .updateAccountsState(this.multipleSelection, "1")
            .then(data => {
              console.log(data);
              if (data.code == 2000) {
                this.$message.success("批量启用成功");
                this.getUserList();
              } else {
                this.$message.error(data.message);
              }
            })
            .catch(err => {
              console.log(err);
              this.$message.error("网络错误");
            });
        } else if (this.operationTpye == "批量停用") {
          console.log(3);
          _UserService
            .updateAccountsState(this.multipleSelection, "0")
            .then(data => {
              console.log(data);
              if (data.code == 2000) {
                this.$message.success("批量停用成功");
                this.getUserList();
              } else {
                this.$message.error(data.message);
              }
            })
            .catch(err => {
              console.log(err);
              this.$message.error("网络错误");
            });
        } else {
          console.log(4);
          this.$message.error("请选择操作类型");
        }
      }
    },
    handleSelectAll(val) {
      console.log(val);
      if (val == true) {
        this.$refs.multipleTable.clearSelection();
        this.userList.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row);
        });
      } else {
        this.$refs.multipleTable.clearSelection();
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val.map(item => {
        return item.id;
      });
      if (this.multipleSelection.length == this.userList.length) {
        this.isAllchecked = true;
      } else {
        this.isAllchecked = false;
      }
    },  
  },
  created() {
    const userInfo = JSON.parse(localStorage.getItem('account')) ;
      //判断用户类型
    this.userType=userInfo.userType;
    this.userParams.projects=userInfo.projectName;
    this.uid = userInfo.uid;
    this.projectName = userInfo.projectName;
    this.getUserList();
    this.getAllProject();
    
    
  }
};
</script>

<style lang="scss">
.user_manage {
  .usmg_title {
    padding-bottom: 20px;
  }
  .table_header{
    
    padding-bottom: 10px;
    height: 50px;
  }
  .tb_head_right{
    float: right
  }
}
</style>
