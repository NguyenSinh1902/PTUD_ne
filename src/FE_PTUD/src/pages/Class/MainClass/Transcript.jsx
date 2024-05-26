import React, { useContext, useEffect, useRef, useState } from "react";
import { Button, Form, Input, Table, Modal, Select } from "antd";
import { fetchDSSV } from "./fetchDSSV";
import { useMaLopHoc } from "../../../provider/authContext";
import { CSVLink } from "react-csv";
import { upload } from "../../../configs/upload";

const EditableContext = React.createContext(null);

const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);

  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[{ required: true, message: `${title} is required.` }]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingRight: 24 }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

const Transcript = () => {
  const [dataSource, setDataSource] = useState([]);
  const [columns, setColumns] = useState([
    {
      title: "STT",
      dataIndex: "STT",
      width: "4%",
      align: "center",
      editable: true,
    },
    {
      title: "Ma Sinh Vien",
      dataIndex: "MaSinhVien",
      width: "6%",
      editable: true,
    },
    {
      title: "Ho Va Ten",
      dataIndex: "HoVaTen",
      width: "10%",
      editable: true,
    },
    {
      title: "Ten Khoa",
      dataIndex: "TenKhoa",
      width: "10%",
      editable: true,
    },
    {
      title: "Email",
      dataIndex: "Email",
      width: "15%",
      editable: true,
    },
  ]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [selectedColumnIndex, setSelectedColumnIndex] = useState();
  const [newColumnName, setNewColumnName] = useState("");
  const [csv, setCSV] = useState([])

  const { maLopHoc } = useMaLopHoc();

  const handleSave = (row) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    if (index > -1) {
      const item = newData[index];
      if (JSON.stringify(item) !== JSON.stringify(row)) {
        newData.splice(index, 1, { ...item, ...row });
        setDataSource(newData);
      }
    }
  };

  const handleDeleteColumn = () => {
    const updatedColumns = columns.filter((col, index) => index !== selectedColumnIndex);
    setColumns(updatedColumns);
    setIsDeleteModalVisible(false);
  };

  const handleAddColumn = () => {
    const newColumn = {
      title: `Column ${columns.length + 1}`,
      dataIndex: `column${columns.length + 1}`,
      width: "10%",
      editable: true,
    };
    setColumns([...columns, newColumn]);
  };

  const handleRenameColumn = () => {
    const updatedColumns = columns.map((col, idx) =>
      idx === selectedColumnIndex ? { ...col, title: newColumnName } : col
    );
    setColumns(updatedColumns);
    setIsRenameModalVisible(false);
    setNewColumnName(" ");
  };

  const showModal = () => {
    setIsDeleteModalVisible(true);
  };

  const showRenameModal = (index) => {
    setSelectedColumnIndex(index);
    setIsRenameModalVisible(true);
  };

  const handleCancel = () => {
    setIsDeleteModalVisible(false);
    setIsRenameModalVisible(false);
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const mergedColumns = columns.map((col, index) => ({
    ...col,
    onCell: (record) => ({
      record,
      editable: col.editable,
      dataIndex: col.dataIndex,
      title: col.title,
      handleSave: handleSave,
    }),
    onHeaderCell: () => ({
      onDoubleClick: () => {
        showRenameModal(index);
      },
    }),
  }));

  const getCSVFile = () => {
    const data = dataSource.map(d => {
      return [d.STT, d.MaSinhVien, d.HoVaTen, d.TenKhoa, d.Email]
    })


    return [["STT", "MaSinhVien", "HoVaTen", "TenKhoa", "Email"], ...data]
  }

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    try {
      const res = await upload(file, maLopHoc)
      console.log(res)
    } catch (error) {
      console.log(error)
    } finally {
      e.target.value = null
    }
  }

  useEffect(() => {
    fetchDSSV(maLopHoc, (response) => {
      setDataSource(
        response.class_students.map((student, index) => ({
          key: index.toString(),
          STT: (index + 1).toString(),
          MaSinhVien: student.MaSinhVien,
          HoVaTen: student.HoVaTen,
          TenKhoa: student.TenKhoa,
          Email: student.Email,
        }))
      );
    });
  }, [maLopHoc]);

  useEffect(() => {
    const data = getCSVFile()
    setCSV(data)
  }, [dataSource])


  return (
    <div>
      <h1 style={{ textAlign: "center", margin: "20px 0" }}>Transcript</h1>
      <Button onClick={handleAddColumn} type="primary" style={{ marginBottom: 16, marginLeft: "20px" }}>
        Add a column
      </Button>
      <Button onClick={showModal} type="primary" style={{ marginBottom: 16, marginLeft: "20px" }}>
        Delete a column
      </Button>
      <Modal title="Delete a Column" visible={isDeleteModalVisible} onOk={handleDeleteColumn} onCancel={handleCancel}>
        <Select
          style={{ width: 120 }}
          onChange={setSelectedColumnIndex}
          placeholder="Select a column"
        >
          {columns.map((col, index) => (
            <Select.Option key={index} value={index}>{col.title}</Select.Option>
          ))}
        </Select>
      </Modal>
      <Button onClick={showRenameModal} type="primary" style={{ marginBottom: 16, marginLeft: "20px" }}>
        Rename Column
      </Button>
      <Button type="primary" style={{ marginBottom: 16, marginLeft: "20px" }} >
        <label htmlFor={"fileSelect"}>Upload</label>
        <input onChange={handleUpload} hidden id="fileSelect" type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
      </Button>
      <Button type="primary" style={{ marginBottom: 16, marginLeft: "20px" }}>
        <CSVLink
          target="_blank"
          filename={"transcript.csv"}
          data={csv}
        > Download</CSVLink>
      </Button>
      <Modal title="Rename Column" visible={isRenameModalVisible} onOk={handleRenameColumn} onCancel={handleCancel}>
        <Select
          onChange={(value) => setSelectedColumnIndex(value)}
          placeholder="Select a column"
          style={{ marginBottom: 5, width: "auto" }}
        >
          {columns.map((col, index) => (
            <Select.Option key={index} value={index}>{col.title}</Select.Option>
          ))}
        </Select>
        <Input
          placeholder="New column name"
          value={newColumnName}
          onChange={(e) => setNewColumnName(e.target.value)}
        />
      </Modal>
      <Table
        components={components}
        rowClassName={() => "editable-row"}
        bordered
        dataSource={dataSource}
        columns={mergedColumns}
        style={{ marginLeft: "20px", marginRight: "20px" }}
        pagination={false}
      />
    </div>
  );
};

export default Transcript;