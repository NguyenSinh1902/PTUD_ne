import React, { useState, useEffect } from "react";
import { Button, Input, Popconfirm, Table, Form } from "antd";
import { useMaLopHoc } from "../../../provider/authContext";
import DS_SinhVienApi from "../../../configs/DS_SinhVienApi";

const StudentList = () => {
  const { maLopHoc } = useMaLopHoc();

  useEffect(() => {
    console.log(maLopHoc);

    const fetchDSSV = async () => {
      const token = localStorage.getItem("token");
      console.log(`Token: ${token}`);
      try {
        const response = await DS_SinhVienApi.getAll(maLopHoc);
        console.log(response.data);

        const LopHocList = response.data;
        console.log(LopHocList);

        if (response.status === 200) {
          setDataSource(
            response.data.class_students.map((student, index) => ({
              key: index.toString(),
              STT: (index + 1).toString(),
              MaSinhVien: student.MaSinhVien,
              HoVaTen: student.HoVaTen,
              TenKhoa: student.TenKhoa,
              Email: student.Email,
            }))
          );
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchDSSV();
  }, [maLopHoc]);

  const [dataSource, setDataSource] = useState([]);
  const [editingKey, setEditingKey] = useState("");
  const [form] = Form.useForm();

  const isEditing = (record) => record.key === editingKey;

  const edit = (key) => {
    setEditingKey(key);
    form.setFieldsValue({
      MaSinhVien: '',
      HoVaTen: '',
      TenKhoa: '',
      Email: '',
      ...dataSource.find((item) => item.key === key),
    });
  };

  const cancel = () => {
    setEditingKey("");
  };

  const handleDelete = async (key) => {
    const studentToDelete = dataSource.find((item) => item.key === key);
    try {
      const response = await DS_SinhVienApi.remove({
        MaSinhVien: studentToDelete.MaSinhVien,
      });
      if (response.status === 200) {
        const newData = dataSource.filter((item) => item.key !== key);
        setDataSource(newData);
        setEditingKey("");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...dataSource];
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        setDataSource(newData);
        setEditingKey("");

        // Call the update API
        try {
          const response = await DS_SinhVienApi.update(newData[index]);
          if (response.status !== 200) {
            console.error("Failed to update data on the server");
          }
        } catch (error) {
          console.error(error);
        }
      }
    } catch (errInfo) {
      console.log("Validate Failed:", errInfo);
    }
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "STT",
      width: "4%",
    },
    {
      title: "MaSinhVien",
      dataIndex: "MaSinhVien",
      width: "8%",
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <EditableCell
            title="MaSinhVien"
            value={record.MaSinhVien}
            dataIndex="MaSinhVien"
            record={record}
            handleSave={handleSave}
            editing={editable}
          />
        ) : (
          <div>{record.MaSinhVien}</div>
        );
      },
    },
    {
      title: "HoVaTen",
      dataIndex: "HoVaTen",
      width: "20%",
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <EditableCell
            title="HoVaTen"
            value={record.HoVaTen}
            dataIndex="HoVaTen"
            record={record}
            handleSave={handleSave}
            editing={editable}
          />
        ) : (
          <div>{record.HoVaTen}</div>
        );
      },
    },
    {
      title: "TenKhoa",
      dataIndex: "TenKhoa",
      width: "20%",
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <EditableCell
            title="TenKhoa"
            value={record.TenKhoa}
            dataIndex="TenKhoa"
            record={record}
            handleSave={handleSave}
            editing={editable}
          />
        ) : (
          <div>{record.TenKhoa}</div>
        );
      },
    },
    {
      title: "Email",
      dataIndex: "Email",
      width: "30%",
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <EditableCell
            title="Email"
            value={record.Email}
            dataIndex="Email"
            record={record}
            handleSave={handleSave}
            editing={editable}
          />
        ) : (
          <div>{record.Email}</div>
        );
      },
    },
    {
      title: "Operation",
      dataIndex: "operation",
      width: "20%",
      render: (_, record) => {
        const editable = isEditing(record);

        return editable ? (
          <span>
            <Button type="primary" onClick={() => handleSave(record.key)}>
              Save
            </Button>
            <Button onClick={cancel}>Cancel</Button>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <a>Cancel</a>
            </Popconfirm>
          </span>
        ) : (
          <span>
            <Button onClick={() => edit(record.key)}>Edit</Button>
            <Popconfirm
              title="Sure to delete?"
              onConfirm={() => handleDelete(record.key)}
            >
              <Button>Delete</Button>
            </Popconfirm>
          </span>
        );
      },
    },
  ];

  const EditableCell = ({
    title,
    value,
    dataIndex,
    record,
    handleSave,
    editing,
  }) => {
    const [inputValue, setInputValue] = useState(value);

    const handleChange = (e) => {
      setInputValue(e.target.value);
    };

    const save = () => {
      handleSave(record.key, dataIndex, inputValue);
    };

    return editing ? (
      <Form.Item
        name={dataIndex}
        style={{ margin: 0 }}
        rules={[
          {
            required: true,
            message: `Please input ${title}!`,
          },
        ]}
      >
        <Input
          value={inputValue}
          onChange={handleChange}
          onPressEnter={save}
          onBlur={save}
        />
      </Form.Item>
    ) : (
      <div>{value}</div>
    );
  };

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Student List</h1>
      <Button
        onClick={async () => {
          const count = dataSource.length;
          const newData = {
            key: count.toString(),
            STT: (count + 1).toString(),
            MaLopHoc: maLopHoc,
            HoVaTen: `Nguyen Van A${count}`,
            Email: `NguyenVan${count}@gmail.com`,
            TenKhoa: `CNPM`,
            SDT: "0902705024",
            MaSinhVien: `SV201133${count}`,
          };
          try {
            const response = await DS_SinhVienApi.add(newData);
            if (response.status === 200) {
              setDataSource([...dataSource, newData]);
            }
          } catch (error) {
            console.error(error);
          }
        }}
        type="primary"
        style={{ marginBottom: 16, marginLeft: 20 }}
      >
        Add a row
      </Button>
      <Form form={form} component={false}>
        <Table
          bordered
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          style={{ marginRight: "250px", marginLeft: "20px" }}
          scroll={{ y: 920 }}
        />
      </Form>
    </div>
  );
};

export default StudentList;
