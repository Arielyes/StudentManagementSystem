const app = new Vue({
  el: "#app",
  data() {
    //校验学号是否存在
    const rulesSNo = (rule, value, callback) => {
      if (this.isEdit) {
        callback();
      }
      //使用Axios进行校验
      axios
        .post(this.baseURL + "sno/check/", {
          sno: value, //这里的sno是后端的sno，value是前端的sno
        })
        .then((res) => {
          //请求成功
          if (res.data.code === 1) {
            if (res.data.exists) {
              callback(new Error("学号已存在"));
            } else {
              callback();
            }
          } else {
            //请求失败
            callback(new Error("校验学号后端出现异常!"));
          }
        })
        .catch((err) => {
          //如果请求失败在控制台打印
          console.log(err);
        });
    };

    return {
      students: [], //所有学员信息
      pageStudents: [], //分页后当前页面的学生信息
      selectStudents: [], //选择复选框的记录集合
      baseURL: "http://192.168.91.130:8000/",
      inputStr: "",

      //========分页相关变量=========
      currentPage: 1, //当前所在页
      pageSize: 10, //每页条数
      total: 0, //总页数

      //========弹出框相关变量=========
      dialogVisible: false,
      dialogTitle: "", //弹出框标题
      isView: false, //标识是否是查看
      isEdit: false, //标识是否是修改
      studentForm: {
        sno: "",
        name: "",
        gender: "",
        birthday: "",
        mobile: "",
        email: "",
        address: "",
        image: "",
        imageUrl: "", //学生头像路径
      },
      rules: {
        sno: [
          //trigger:"blur":表示失去焦点时触发；即不满足条件时，鼠标移走，
          //输入框报红，显示message信息
          { required: true, message: "学号不能为空", trigger: "blur" },
          {
            pattern: /^[9][5]\d{3}$/,
            message: "学号必须是95开头的5位数",
            trigger: "blur",
          },
          { validator: rulesSNo, trigger: "blur" },
        ],
        name: [
          { required: true, message: "姓名不能为空", trigger: "blur" },
          {
            pattern: /^[\u4e00-\u9fa5]{2,5}$/,
            message: "姓名必须是2~5个汉字",
            trigger: "blur",
          },
        ],
        //change：在输入时即可得到反馈
        gender: [
          { required: true, message: "性别不能为空", trigger: "change" },
        ],
        birthday: [
          {
            required: true,
            message: "出生日期不能为空",
            trigger: "change",
          },
        ],
        mobile: [
          { required: true, message: "手机号码不能为空", trigger: "blur" },
          {
            pattern: /^[1][35789]\d{9}$/,
            message: "手机号码必须符合规范",
            trigger: "blur",
          },
        ],
        email: [
          { required: true, message: "邮箱地址不能为空", trigger: "blur" },
          {
            pattern: /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
            message: "邮箱地址必须符合规范",
            trigger: "blur",
          },
        ],
        address: [
          { required: true, message: "家庭住址不能为空", trigger: "change" },
        ],
      },
    };
  },
  mounted() {
    //页面加载完成后，调用getStudents方法加载数据
    this.getStudents();
  },
  methods: {
    //获取所有学生信息
    getStudents: function () {
      //记录this的地址
      let that = this;
      //所有Asios实现Ajax请求
      axios
        .get(that.baseURL + "students/")
        .then(function (res) {
          //请求成功后执行的函数
          if (res.data.code === 1) {
            //把数据给students
            that.students = res.data.data;
            //获取返回记录的总行数
            that.total = res.data.data.length;
            //获取当前页面的数据
            that.getPageStudents();
            //提示
            that.$message({
              message: "数据加载成功",
              type: "success",
            });
          } else {
            //失败提示
            that.$message.error(res.data.msg);
          }
        })
        .catch(function (err) {
          //请求失败后执行的函数
          console.log(err);
        });
    },
    //
    getAllStudents() {
      //清空输入条件
      this.inputStr = "";
      this.getStudents();
    },

    //获取当前页面的学生数据
    getPageStudents() {
      //清空pageStudents中的数据
      this.pageStudents = [];
      //获得当前页的数据
      for (
        let i = (this.currentPage - 1) * this.pageSize;
        i < this.total;
        i++
      ) {
        //遍历数据添加到pageStudents中
        this.pageStudents.push(this.students[i]);
        //判断是否达到一页的要求
        if (this.pageStudents.length === this.pageSize) break;
      }
    },
    //实现学生信息查询
    queryStudents() {
      //使用Ajax请求--POST-->传递InputStr
      let that = this;
      //开始Ajax请求
      axios
        .post(that.baseURL + "students/query/", {
          inputstr: that.inputStr, //这里的inputstr与后端的inputstr保持一致
        })
        .then(function (res) {
          if (res.data.code === 1) {
            //把数据给students
            that.students = res.data.data;
            //获取返回记录的总行数
            that.total = res.data.data.length;
            //获取当前页面的数据
            that.getPageStudents();
            //提示
            that.$message({
              message: "查询数据成功",
              type: "success",
            });
          } else {
            //失败提示
            that.$message.error(res.data.msg);
          }
        })
        .catch(function (err) {
          that.$message.error("获取后端查询结果出现异常！" + err);
        });
    },
    //添加学生时打开表单
    addStudent() {
      this.dialogTitle = "添加学生信息";
      this.dialogVisible = true;
      console.log(this.dialogVisible);
    },
    //根据学号获取Image
    getImageBySno(sno) {
      //遍历
      for (oneStudent of this.students) {
        if (oneStudent.sno == sno) {
          return oneStudent.image;
        }
      }
    },
    //查看学生明细界面展示
    viewStudent(row) {
      this.dialogTitle = "学生详细信息";
      this.dialogVisible = true;
      this.isView = true;
      this.studentForm = JSON.parse(JSON.stringify(row));
      //获取照片
      this.studentForm.image = this.getImageBySno(row.sno);
      //获取照片URL
      this.studentForm.imageUrl =
        this.baseURL + "media/" + this.studentForm.image;
    },
    //修改学生明细界面展示
    updateStudent(row) {
      this.dialogTitle = "修改学生信息";
      this.isEdit = true;
      this.dialogVisible = true;
      this.studentForm = JSON.parse(JSON.stringify(row));
      //获取照片
      this.studentForm.image = this.getImageBySno(row.sno);
      //获取照片URL
      this.studentForm.imageUrl =
        this.baseURL + "media/" + this.studentForm.image;
    },
    //删除学生信息
    deleteStudent(row) {
      //删除提示
      this.$confirm(
        "是否删除学生【学号：" + row.sno + "\t姓名:" + row.name + "】的信息？",
        "警告",
        {
          confirmButtonText: "确认删除",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(() => {
          //确认删除响应事件
          let that = this;

          axios
            .post(that.baseURL + "student/delete/", { sno: row.sno })
            .then(function (res) {
              //执行成功
              if (res.data.code === 1) {
                //获取所有学生的信息
                that.students = res.data.data;
                //获取记录条数
                that.total = res.data.data.length;
                //获取分页信息
                that.getPageStudents();
                //提示
                that.$message({
                  message: "数据删除成功",
                  type: "success",
                });
              } else {
                //失败提示
                that.$message.error(res.data.msg);
              }
            })
            .catch((err) => {
              console.log(err);
              that.$message.error("更新后端结果出现异常");
            });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    //批量删除学生信息
    deleteStudents(row) {
      //删除提示
      this.$confirm(
        "是否确认批量删除" + this.selectStudents.length + "个学生的信息？",
        "警告",
        {
          confirmButtonText: "确认删除",
          cancelButtonText: "取消",
          type: "warning",
        }
      )
        .then(() => {
          //确认删除响应事件
          let that = this;

          axios
            .post(that.baseURL + "students/delete/", {
              students: that.selectStudents,
            })
            .then(function (res) {
              //执行成功
              if (res.data.code === 1) {
                //获取所有学生的信息
                that.students = res.data.data;
                //获取记录条数
                that.total = res.data.data.length;
                //获取分页信息
                that.getPageStudents();
                //提示
                that.$message({
                  message: "批量删除成功",
                  type: "success",
                });
              } else {
                //失败提示
                that.$message.error(res.data.msg);
              }
            })
            .catch((err) => {
              console.log(err);
              that.$message.error("更新后端结果出现异常");
            });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    //关闭弹出框表单
    closeDialogForm(formName) {
      this.$refs[formName].resetFields(); //关闭验证信息
      //清空
      this.studentForm.sno = "";
      this.studentForm.name = "";
      this.studentForm.gender = "";
      this.studentForm.birthday = "";
      this.studentForm.mobile = "";
      this.studentForm.email = "";
      this.studentForm.address = "";
      this.studentForm.image = "";
      this.studentForm.imageUrl = "";
      //关闭UI
      this.dialogVisible = false;

      this.isEdit = false;
      this.isView = false;
    },
    //上传学生头像，点击确定后执行的事件
    uploadPicturePost(file) {
      let that = this;
      // 定义一个FormData类
      let fileReq = new FormData();
      //把照片传进去
      fileReq.append("avatar", file.file);
      //使用Axios发起Ajax请求
      axios({
        method: "POST",
        url: that.baseURL + "upload/",
        data: fileReq,
      })
        .then((res) => {
          //根据code判断是否上传成功
          if (res.data.code === 1) {
            //把照片给image
            that.studentForm.image = res.data.name;
            //拼接imageurl
            that.studentForm.imageUrl = that.baseURL + "media/" + res.data.name;
          } else {
            //失败提示
            that.$message.error(res.data.msg);
          }
        })
        .catch((err) => {
          console.log(err);
          that.$message.error("上传头像出现异常");
        });
    },
    //导入excel文件
    uploadExcelPost(file) {
      let that = this;
      // 定义一个FormData类
      let fileReq = new FormData();
      // 把Excel文件传进去
      fileReq.append("Excel", file.file);
      // 使用Axios发起Ajax请求
      axios({
        method: "POST",
        url: that.baseURL + "excel/import/",
        data: fileReq,
      })
        .then((res) => {
          // 根据code判断是否上传成功
          if (res.data.code === 1) {
            // 刷新页面
            //获取所有学生的信息
            that.students = res.data.data;
            //获取记录条数
            that.total = res.data.data.length;
            //获取分页信息
            that.getPageStudents();
            //提示
            that.$message({
              message: "学生信息导入成功成功",
              type: "success",
            });
          } else {
            // 失败提示
            that.$message.error(res.data.msg);
          }
        })
        .catch((err) => {
          console.log(err);
          that.$message.error("上传Excel文件出现异常");
        });
    },
    //导出excel文件
    exportExcelPost() {
      let that = this;
      axios
        .get(that.baseURL + "excel/export/")
        .then((res) => {
          if (res.data.code === 1) {
            //拼接完整url
            let url = that.baseURL + "media/" + res.data.name;
            //下载
            if (window.open(url)) {
              this.$message({
                message: "成功下载文件",
                type: "success",
              });
            }
          } else {
            that.$message.error("导出Excel文件出现异常");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    submitStudentForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          //校验成功后，执行添加或者修改
          if (this.isEdit) {
            //修改
            this.submitUpdateStudent();
          } else {
            //添加
            this.submitAddStudent();
          }
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    //添加学生明细功能实现
    submitAddStudent() {
      let that = this;
      //执行Axios请求
      axios
        .post(that.baseURL + "student/add/", that.studentForm)
        .then(function (res) {
          //执行成功
          if (res.data.code === 1) {
            //获取所有学生的信息
            that.students = res.data.data;
            //获取记录条数
            that.total = res.data.data.length;
            //获取分页信息
            that.getPageStudents();
            //提示
            that.$message({
              message: "数据加载成功",
              type: "success",
            });
            that.closeDialogForm("studentForm");
          } else {
            //失败提示
            that.$message.error(res.data.msg);
          }
        })
        .catch((err) => {
          console.log(err);
          that.$message.error("获取后端查询结果出现异常");
        });
    },
    //修改学生明细功能实现
    submitUpdateStudent() {
      let that = this;
      //执行Axios请求
      axios
        .post(that.baseURL + "student/update/", that.studentForm)
        .then(function (res) {
          //执行成功
          if (res.data.code === 1) {
            //获取所有学生的信息
            that.students = res.data.data;
            //获取记录条数
            that.total = res.data.data.length;
            //获取分页信息
            that.getPageStudents();
            //提示
            that.$message({
              message: "数据加载成功",
              type: "success",
            });
            that.closeDialogForm("studentForm");
          } else {
            //失败提示
            that.$message.error(res.data.msg);
          }
        })
        .catch((err) => {
          console.log(err);
          that.$message.error("更新后端结果出现异常");
        });
    },

    //选择复选框时触发的操作
    handleSelectionChange(data) {
      this.selectStudents = data;
    },
    //分页时修改每页的行数
    handleSizeChange(size) {
      this.pageSize = size;
      //数据重新分页
      this.getPageStudents();
    },
    //调整当前页码
    handleCurrentChange(pageNumber) {
      //修改当前页码
      this.currentPage = pageNumber;
      //数据重新分页
      this.getPageStudents();
    },
  },
});
